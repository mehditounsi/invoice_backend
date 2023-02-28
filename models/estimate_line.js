const genericModel = require('./model');
const { getCompanyId } = require('../helpers/context')

const name = 'Estimate_line';
const tableName = 'estimates_line';
const selectableProps = [
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

    const getEstimatelineByEstimate = async (id) => {
        try {
            let estimate_line = await knex.select().where({estimate_id : id, company_id : getCompanyId()}).from(tableName);
            return estimate_line;
        } catch (error) {
            return error;
        }
    };

    const destroyByAttribute = async (id) =>{
        try {
            let estimate_line = await knex.del().from(tableName).returning(selectableProps).where({ estimate_id : id , company_id : getCompanyId() })
            return estimate_line
        } catch (error) {
            return error  
        }
    }


    return {
        ...model,
        getEstimatelineByEstimate,
        destroyByAttribute
    };
};
