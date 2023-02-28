const genericModel = require('./model');
const { getCompanyId } = require('../helpers/context')

const name = 'Client';
const tableName = 'clients';
const selectableProps = [
    'id',
    'name',
    'address',
    'email',
    'telephone',
    'fax',
    'timbre',
    'vat',
    'tax_identification',
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

    const searchClient = async (search)=>{
        try {
            let client = await knex.select().from(tableName).where( (qb) => {
    
                qb.where({company_id:getCompanyId()})
                
                if (search) {
                    qb.where('name', 'like', `%${search}%`)
                }
            
              })
              .orWhere( (qb) => {
    
                qb.where({company_id:getCompanyId()})
                
                if (search) {
                    qb.where('address', 'like', `%${search}%`)
                }
            
              }).orWhere( (qb) => {
    
                qb.where({company_id:getCompanyId()})
                
                if (search) {
                    qb.where('tax_identification', 'like', `%${search}%`)
                }
            
              }).orWhere( (qb) => {
    
                qb.where({company_id:getCompanyId()})
                
                if (search) {
                    qb.where('telephone', 'like', `%${search}%`)
                }
            
              })
            
            
            return client
        } catch (error) {
            console.log(error);
            throw (error);
        }
    }


    const find = async (filter) => {
        try {
            let find =  await knex.select(selectableProps).from(tableName).where('tax_identification' , 'like', `%${filter}%`).where({company_id : getCompanyId()})
            return find 
        } catch (error) {
            console.log(error);
        }
       
    }


    const findAll = async () => {
        let all = await knex.select(selectableProps).from(tableName).where({ company_id: getCompanyId() })
        return all
    }


    let modelFunctions = Object.keys(model).
    filter(function (key) {
        return (!key.includes('find') || !key.includes('findAll'));
    }).reduce((cur, key) => {
        return Object.assign(cur, { [key]: model[key] })
    }, {});
    
    
    return {
        ...modelFunctions,
        searchClient,
        find,
        findAll
    };
};
