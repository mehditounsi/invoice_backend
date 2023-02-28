const genericModel = require('./model');

const name = 'Template';
const tableName = 'templates';
const selectableProps = [
    'id',
    'template',
    'type',
    'isDefault',
    'name',
    'date',
    'language'
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
            let rs = await knex.insert(props).into(tableName).returning(selectableProps)
            if (rs && rs.length > 0){
                return rs[0]
            }
            return null     
        } catch (error) {
            throw error
        }
    };

    const findAll = async () => {
        let template = await knex.select(selectableProps).from(tableName);
        return template
    }
    

    const findById = async (id) => {
        let rs = await knex.select(selectableProps).from(tableName).where({ id });
        if (rs && rs.length > 0 ){
            return rs[0]
        }
        return null
    };

    const update = async (id, props) => {
        delete props.id;
      
        props.company_id = undefined
        let rs = await knex
            .update(props)
            .from(tableName)
            .returning(selectableProps)
            .where( {id} )
            
            if (rs && rs.length > 0) {
                return rs[0]
            }
            return null
    };

    const destroy = async (id) => {
        let rs = await knex.del().from(tableName).returning(selectableProps).where( {id} );
        if (rs && rs.length > 0) {
            return rs[0]
        }
        return null
    };


    let modelFunctions = Object.keys(model).
    filter(function (key) {
        return (!key.includes('findById')||!key.includes('create')||!key.includes('destroy')||!key.includes('update')||!key.includes('findAll'));
  
    }).
    reduce((cur, key) => { 
      return Object.assign(cur, { [key]: model[key] })}, {});

    return {
        ...modelFunctions,
        create,
        findById,
        destroy,
        update,
        findAll
    };
};
