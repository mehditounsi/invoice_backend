const genericModel = require('./model');
const { getCompanyId } = require('../helpers/context')

const name = 'Invoice_line';
const tableName = 'invoice_line';
const selectableProps = [
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

    const getInvoiceLineByInvoice = async (_invoice_id) => {
        try {
            let invoice_line = await knex.select().where({ invoice_id: _invoice_id, company_id: getCompanyId() }).from(tableName);
            return invoice_line;
        } catch (error) {
            return error;
            throw (error);

        }
    };


    const invoicelineTotalByArticle = async (start_date, end_date, search) => {
        try {
            let props = [
                "invoice_line.code AS code",
                "invoice_line.article AS name",
                "invoice_line.price AS price"
            ]


            let total = await knex.select(props).from(tableName, 'invoices')
                .leftJoin("invoices", "invoices.id", "=", "invoice_line.invoice_id")
                .where(
                    (qb) => {
                        qb.where({ 'invoice_line.company_id': getCompanyId() })

                        if (start_date && end_date) {
                            qb.whereBetween("date", [start_date, end_date]);
                        }

                    }).andWhere((qb) => {

                        qb.where({ 'invoice_line.company_id': getCompanyId() })

                        if (search) {
                            qb.where("code", "like", `%${search}%`)
                                .orWhere("article", "like", `%${search}%`);
                        }
                    })
                .sum('total AS total').groupBy('invoice_line.article_id', 'invoice_line.article', 'invoice_line.code',"invoice_line.price")
                .sum('invoice_line.discount AS discount').groupBy('invoice_line.article_id', 'invoice_line.article', 'invoice_line.code',"invoice_line.price")
                .sum('quantity AS quantity').groupBy('invoice_line.article_id', 'invoice_line.article', 'invoice_line.code',"invoice_line.price")


            return total

        } catch (error) {
            console.log(error);
            throw (error);

        }
    }

    const destroyByAttribute = async (id) =>{
        try {
            let invoice_line = await knex.del().from(tableName).returning(selectableProps).where({ invoice_id : id , company_id : getCompanyId() })
            return invoice_line
        } catch (error) {
            console.log(error);
            throw(error)
        }
    }

    return {
        ...model,
        getInvoiceLineByInvoice,
        destroyByAttribute,
        invoicelineTotalByArticle
    };
};
