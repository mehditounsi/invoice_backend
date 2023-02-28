const genericModel = require('./model');

const name = 'Vat';
const tableName = 'vat';
const selectableProps = [
    'id',
    'vat',
    'company_id',
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


    const defaultCreate = async (props) => {
        try {
            let rs = await knex.insert(props).into(tableName).returning(selectableProps);
            if (rs && rs.length > 0) {
                return rs[0]
            }
            return null
        } catch (error) {
            console.error(error)
        }
    }


    return {
        ...model,
        defaultCreate
    };
};
