const genericModel = require('./model');
const { getCompanyId } = require('../helpers/context')


const name = 'Attachment';
const tableName = 'attachments';
const selectableProps = [
    'id',
    'attachment',
    'filename',
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

    const findByIdForAdmin = async (id) =>{
        let rs = await knex.select(selectableProps).from(tableName).where({id});
        if (rs && rs.length > 0 ){
            return rs[0]
        }
        return null

    }

    const create = async (props) => {
        props.company_id = getCompanyId()
        let rs = await knex.insert(props).into(tableName).returning(selectableProps);
        if (rs && rs.length > 0){
            return rs[0]
        }
        return null
    };
    const findById = async (id) => {
        let rs = await knex.select(selectableProps).from(tableName).where({ id , company_id : getCompanyId()});
        if (rs && rs.length > 0 ){
            return rs[0]
        }
        return null
    };

    const update = async (id, props) => {
        delete props.id;
        let rs = await knex
            .update(props)
            .from(tableName)
            .where({id})
            .returning(selectableProps)

            if (rs && rs.length > 0) {
                return rs[0]
            }
            return null
    };

    let modelFunctions = Object.keys(model).
    filter(function (key) {
        return (!key.includes('findById')||!key.includes('create')||!key.includes('update'));
  
    }).
    reduce((cur, key) => { 
      return Object.assign(cur, { [key]: model[key] })}, {});
  
    return {
        ...modelFunctions,
        create,
        findById,
        update,
        findByIdForAdmin
    };

};