const { getCompanyId } = require('../helpers/context')

const genericModel = require("./model");

const name = "Estimate";
const tableName = "estimates";
const timeout = 1000;
const selectableProps = [
  "id",
  "number",
  "date",
  "validation_date",
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

    let rs = await knex.insert(props).into(tableName).returning(selectableProps).timeout(timeout);

    if (rs && rs.length > 0) {
      return rs[0];
    }
    return null
  };


  const sortEstimate = async (date) => {
    try {
      let sorted_estimate = await knex
        .select()
        .from(tableName)
        // .where('date', '>=', date.date.$gte)
        // .where('date', '<', date.date.$lte)
        .whereBetween("date", [date.date.$gte, date.date.$lte])
        .andWhere({ company_id: getCompanyId() })
        .orderBy("num_interne", "desc")
        .limit(1);
      return sorted_estimate;
    } catch (error) {
      console.log(error);
      throw (error);

    }
  };

  const findHydratedEstimate = async (id) => {
    try {
      let props = [
        "articles.id AS article_id",
        "articles.code AS article_code",
        "articles.article AS article_name",
        "articles.price AS article_price",
        "articles.vat AS article_vat",
        "articles.status",
        "articles.company_id",
        "estimates_line.id AS estimate_line_id",
        "estimates_line.code AS estimate_line_code",
        "estimates_line.article AS estimate_line_article",
        "estimates_line.price AS estimate_line_price",
        "estimates_line.vat AS estimate_line_vat",
        "estimates_line.total",
        "estimates_line.estimate_id",
        "estimates_line.article_id",
        "estimates_line.quantity",
        "estimates_line.discount",
      ];
      let estimate = await knex.select().from(tableName).where({ id, company_id: getCompanyId() });
      let estimate_lines = await knex
        .select(props)
        .from("estimates_line", "articles")
        .where({ estimate_id: id, "estimates_line.company_id": getCompanyId() })
        .returning(id)
        .leftJoin("articles", "articles.id", "=", "estimates_line.article_id");

      return {
        header: estimate[0],
        lines: estimate_lines,
      };
    } catch (error) {
      console.log(error);
      throw (error);

    }
  };

  const updateHydratedEstimate = async (id, data) => {
    try {
      // data.header.company_id = undefined
      let old_hydrated_estimate = await knex.select().from(tableName).where({ id: id, company_id: getCompanyId() })
      if (old_hydrated_estimate) {

        if (data.header.client) {
          let client
          if (typeof data.header["client"] == "string") {
            client = JSON.parse(data.header["client"])
          } else {
            client = data.header["client"]
          }

          let full_info =
            client.name +
            "  " +
            client.tax_identification +
            "  " +
            old_hydrated_estimate[0]["number"];

          data["header"]["full_info"] = full_info;

        }

        if (data.header.company) {
          data.header.company = JSON.stringify(data.header.company);
        }


        let estimate = await knex
          .update(data.header)
          .from(tableName)
          .returning(selectableProps)
          .where({ id, company_id: getCompanyId() });

        await knex.del().from("estimates_line").where({ estimate_id: id });

        for (let i = 0; i < data.lines.length; i++) {
          data.lines[i].estimate_id = id;
          data.lines[i]["company_id"] = getCompanyId()
        }



        let estimate_line = await knex.insert(data.lines).into("estimates_line")
          .returning([
            'id',
            'code',
            'article',
            'price',
            'vat',
            'quantity',
            'discount',
            'total',
            'estimate_id',
            'article_id',
            'company_id'
          ])

        return { header: estimate, lines: estimate_line };
      }
      else {
        throw new Errors.InvalidDataError('invalid id ')
      }
    } catch (error) {
      console.log(error);
      throw (error);
    }
  };

  const searchEstimate = async (search, start_date, end_date, status) => {
    try {
      let estimate = await knex
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

      return estimate;
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


  return {
    ...modelFunctions,
    create,
    sortEstimate,
    searchEstimate,
    findHydratedEstimate,
    updateHydratedEstimate,
  };
};
