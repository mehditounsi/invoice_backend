const genericModel = require('./model');

const name = 'Company';
const tableName = 'companies';
const selectableProps = [
    'id',
    'name',
    'address',
    'telephone',
    'fax',
    'rib',
    'logo',
    'tax_identification',
    'timbre',
    'digits',
    'quantity_digits',
    'discount',
    'article_edition',
    'config',
    'footer',
    'invoice_name',
    'estimate_name',
    'status',
    'invoice_template_id',
    'estimate_template_id',
    'invoice_template_id_fr',
    'estimate_template_id_fr',
    'invoice_template_id_ar',
    'estimate_template_id_ar',
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

        let rs = await knex.insert(props).into(tableName).returning(selectableProps);
        
        return rs[0]
    };
    const update = async (id, props) => {
        delete props.id;
        let condition = {
            id: id,
        }
        let rs = await knex
            .update(props)
            .from(tableName)
            .returning(selectableProps)
            .where( condition );
            
            if (rs && rs.length > 0) {
                return rs[0]
            }
            return null
    };
    const findById = async (id) => {
        let rs = await knex.select(selectableProps).from(tableName).where({ id });
        if (rs && rs.length > 0 ){
            return rs[0]
        }
        return null
    };

    const find = async (filters) => {
      await knex.select(selectableProps).from(tableName).where(filters , 'like' ,'%rowlikeme%');
    }


    const findAll = async () => {
        let all = await knex.select(selectableProps).from(tableName);
        return all
    }

    

    let modelFunctions = Object.keys(model).
  filter(function (key) {
      return (!key.includes('findById')||!key.includes('create')||!key.includes('find')||!key.includes('update')||!key.includes('findAll'));

  }).
  reduce((cur, key) => { 
    return Object.assign(cur, { [key]: model[key] })}, {});


    let functions = {
        ...modelFunctions,
        findById,
        create,
        find,
        update,
        findAll
    }

    return functions;
};
