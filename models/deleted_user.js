const genericModel = require('./model');

const name = 'DeletedUsers';
const tableName = 'deleted_users';
const selectableProps = [
    'id',
    'old_id',
    'login',
    'role',
    'name',
    'uid',
    'company_id',
    'signature'
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
        let rs = await knex.insert(props).returning(selectableProps).into(tableName);
        if (rs && rs.length > 0){
            return rs[0]
        }
        return null
    };

    let modelFunctions = Object.keys(model).
    filter(function (key) {
        return (!key.includes('create'));
  
    }).
    reduce((cur, key) => { 
      return Object.assign(cur, { [key]: model[key] })}, {});
  
    return {
        ...modelFunctions,
        create
    };

};