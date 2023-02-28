const genericModel = require("./model");
const Errors = require('../helpers/errors');
const { getCompanyId } = require('../helpers/context')

const name = "Invoice";
const tableName = "invoices";
const timeout = 1000;
const selectableProps = [
  "id",
  "number",
  "date",
  "signature",
  "signature_date",
  "timbre",
  "client",
  "company",
  "discount",
  "total_ht",
  "total_vat",
  "total_price",
  "rate",
  "client_id",
  "company_id",
  "status",
  "num_interne",
  "full_info",
  "template_id",
  "template_id_fr",
  "template_id_ar"
  // 'created_at',
  // 'updated_at',
];

module.exports = (knex) => {
  const model = genericModel({
    knex,
    name,
    tableName,
    selectableProps,
  });

  const create = async (props) => {
    try {
      props.company_id = getCompanyId()

      if (props.client) {
        let client
        if (typeof props["client"] == "string") {
          client = JSON.parse(props["client"])
        } else {
          client = props["client"]
        }

        let full_info =
          client.name +
          "  " +
          client.tax_identification +
          "  " +
          props["number"];

        props["full_info"] = full_info;
      }

      let rs = await knex.insert(props).into(tableName).returning(selectableProps).timeout(timeout)

      if (rs && rs.length > 0) {
        return rs[0];
      }
      return null
    } catch (error) {
      console.log(error);
      throw (error);

    }
  };


  const sortInvoice = async (date) => {
    try {
      let sorted_invoice = await knex
        .select()
        .from(tableName)
        // .where('date', '>=', date.date.$gte)
        // .where('date', '<', date.date.$lte)
        .whereBetween("date", [date.date.$gte, date.date.$lte])
        .andWhere({ company_id: getCompanyId() })
        .orderBy("num_interne", "desc")
        .limit(1);
      return sorted_invoice;
    } catch (error) {
      console.log(error);
      throw (error);

    }
  };

  const findHydratedInvoice = async (id) => {
    try {
      let props = [
        "articles.id AS article_id",
        "articles.code AS article_code",
        "articles.article AS article_name",
        "articles.price AS article_price",
        "articles.vat AS article_vat",
        "articles.status",
        "articles.company_id",
        "invoice_line.id AS invoice_line_id",
        "invoice_line.code AS invoice_line_code",
        "invoice_line.article AS invoice_line_article",
        "invoice_line.price AS invoice_line_price",
        "invoice_line.vat AS invoice_line_vat",
        "invoice_line.total",
        "invoice_line.invoice_id",
        "invoice_line.article_id",
        "invoice_line.quantity",
        "invoice_line.discount",
      ]


      let invoice = await knex.select().from(tableName, 'attachments').where({ id, company_id: getCompanyId() })
      let invoice_lines = await knex
        .select(props)
        .from("invoice_line", "articles")
        .where({ "invoice_line.invoice_id": id, "invoice_line.company_id": getCompanyId() })
        .returning(id)
        .leftJoin("articles", "articles.id", "=", "invoice_line.article_id");
      return {
        header: invoice[0],
        lines: invoice_lines,
      }
    } catch (error) {
      console.log(error);
      throw (error);
    }
  };

  const updateHydratedInvoice = async (id, data) => {
    try {
      data.header.company_id = undefined
      let old_hydrated_invoice = await knex.select().from(tableName).where({ id: id, company_id: getCompanyId() })
      if (old_hydrated_invoice) {
        if (data.header.client) {
          let client
          if (typeof data.header.client == "string") {
            client = JSON.parse(data.header.client)
          } else {
            client = data.header.client
          }
          let full_info =
            client.name +
            "  " +
            client.tax_identification +
            "  " +
            old_hydrated_invoice[0].number;

          data["header"]["full_info"] = full_info;
        }

        if (data.header.company) {
          data.header.company = JSON.stringify(data.header.company);
        }

        let invoice = await knex
          .update(data.header)
          .from(tableName)
          .returning(selectableProps)
          .where({ id, company_id: getCompanyId() });


        await knex.del().from("invoice_line").where({ invoice_id: id });

        for (let i = 0; i < data.lines.length; i++) {
          data.lines[i].invoice_id = id;
          data.lines[i]["company_id"] = getCompanyId()
        }

        let invoice_line = await knex.insert(data.lines).into("invoice_line")
          .returning([
            'id',
            'code',
            'article',
            'price',
            'vat',
            'quantity',
            'discount',
            'total',
            'invoice_id',
            'article_id',
            'company_id'
          ]);

        return { header: invoice, lines: invoice_line };

      }
      else {
        throw new Errors.InvalidDataError('invalid id')
      }

    } catch (error) {
      console.log(error);
      throw (error);
    }
  };

  const invoiceTotalByClient = async (start_date, end_date, search) => {
    try {
      let props = [
        "clients.id AS id",
        "clients.name AS name",
        "clients.tax_identification AS tax_id",
        "clients.address AS address",
        "clients.email AS email",
        "clients.telephone AS phone",
        "clients.fax AS fax",
        "clients.timbre AS timbre",
        "clients.vat AS vat",
        "clients.company_id AS company_id",
      ]

      let total = await knex.select(props).from(tableName, 'clients')
        .where(
          (qb) => {
            qb.where({ 'clients.company_id': getCompanyId() })
            if (start_date && end_date) {
              qb.whereBetween("date", [start_date, end_date]);
            }

          }).andWhere((qb) => {
            qb.where({ 'clients.company_id': getCompanyId() })

            if (search) {
              qb.where("clients.name", "like", `%${search}%`)
                .orWhere("clients.tax_identification", "like", `%${search}%`);
            }
          })
        .leftJoin("clients", "clients.id", "=", "client_id")
        .sum('total_price AS total_price').groupBy('clients.id')
        .sum('total_ht AS total_ht').groupBy('clients.id')
        .sum('discount AS discount').groupBy('clients.id')
        .sum('total_vat AS total_vat').groupBy('clients.id')
        .count('client_id AS invoices').where({ 'clients.company_id': getCompanyId() })


      return total

    } catch (error) {
      console.log(error);
      throw (error);
    }
  }

  const searchInvoice = async (search, start_date, end_date, status) => {
    try {
      let invoice = await knex
        .select()
        .from(tableName)
        .where((qb) => {

          qb.where({ company_id: getCompanyId() })

          if (search) {
            qb.where("full_info", "like", `%${search}%`);
          }
          if (start_date && end_date) {
            qb.whereBetween("date", [start_date, end_date]);
          }
          if (status) {
            qb.whereIn("status", status);
          }
        });

      return invoice;
    } catch (error) {
      console.log(error);
      throw (error);
    }
  };

  const getAllHydratedInvoices = async () => {
    try {
      let props = [
        "invoice_line.code AS invoice_line_code",
        "invoice_line.article AS invoice_line_article",
        "invoice_line.price AS invoice_line_price",
        "invoice_line.vat AS invoice_line_vat",
        "invoice_line.total",
        "invoice_line.quantity",
        "invoice_line.discount",
        "number",
        "date",
        "client",
      ];

      let hydratedInvoice = await knex.select(props).from("invoice_line")
        .leftJoin(tableName, "invoices.id", "=", "invoice_line.invoice_id")
        .where({ 'invoice_line.company_id': getCompanyId() })

      return hydratedInvoice

    } catch (error) {
      console.log(error);
      throw (error);
    }
  }

  const getInvoiceMonthly = async (year) => {
    try {

      let months = await knex.raw(`SELECT DISTINCT SUBSTRING(date::varchar,6 ,2) as month, count( DISTINCT client_id) as client_count, count(*) as invoice_count, sum(total_ht) as total_ht, sum(total_price) as total_price FROM ${tableName}
    WHERE  SUBSTRING(date::varchar,0,5) = '${year}' AND company_id = ${getCompanyId()}
    GROUP by month
    order by month DESC`
      )

      let year_counts = await knex.raw(`SELECT DISTINCT SUBSTRING(date::varchar,0 ,5) as year, count( DISTINCT client_id) as client_count, count(*) as invoice_count, sum(total_ht) as total_ht, sum(total_price) as total_price FROM ${tableName}
      WHERE  SUBSTRING(date::varchar,0,5) = '${year}' AND company_id = ${getCompanyId()}
      GROUP by year`)
      if (year_counts.rows[0]) {
        return {
          year: year_counts.rows[0].year,
          clients: year_counts.rows[0].client_count,
          invoices: year_counts.rows[0].invoice_count,
          total_ht: year_counts.rows[0].total_ht,
          total_price: year_counts.rows[0].total_price,
          monthlySales: months.rows
        }
      }
    } catch (error) {
      console.log(error);
      throw (error);
    }
  }

  const getInvoiceYears = async () => {
    try {

      let years = await knex.raw(`SELECT DISTINCT SUBSTRING(date::varchar,0 ,5) as year FROM ${tableName}
      WHERE company_id = ${getCompanyId()}
      GROUP by year
      order by year DESC`
      )
      return years.rows
    } catch (error) {
      console.log(error);
      throw (error);
    }
  }



  let modelFunctions = Object.keys(model).
    filter(function (key) {
      return !key.includes('create');

    }).
    reduce((cur, key) => {
      return Object.assign(cur, { [key]: model[key] })
    }, {});

  let functions = {
    ...modelFunctions,
    create,
    sortInvoice,
    findHydratedInvoice,
    updateHydratedInvoice,
    searchInvoice,
    invoiceTotalByClient,
    getAllHydratedInvoices,
    getInvoiceMonthly,
    getInvoiceYears
  };

  return functions;
};
