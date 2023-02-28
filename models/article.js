const genericModel = require('./model');
const { getCompanyId } = require('../helpers/context')

const name = 'Article';
const tableName = 'articles';
const selectableProps = [
    'id',
    'code',
    'article',
    'price',
    'vat',
    'status',
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
    const searchArticle = async (search , status)=>{
        try {
      

                let article = await knex.select().from(tableName).where(
                    (qb) => {
    
                        qb.where({company_id:getCompanyId()})
                        
                        if (search) {
                            qb.where('article', 'like', `%${search}%`)
                        }
                        
                        if (status) {
                            qb.where('status', '=', status);
                        }
                    
                      }
                ).orWhere( (qb) => {
    
                    qb.where({company_id:getCompanyId()})
                    
                    if (search) {
                        qb.where('code', 'like', `%${search}%`);
                    }
                    
                    if (status) {
                        qb.where('status', '=', status);
                    }
                
                  })
                
                return article
            

               
        } catch (error) {
            console.log(error);
            throw (error);
        }
    }

    const find = async (code) => {
        let condition = {
            code: code,
            company_id: getCompanyId()
        }
        let find =  await knex.select(selectableProps).from(tableName).where(condition);
        return find 
    }

    const findAll = async () => {
        let all = await knex.select(selectableProps).from(tableName).where({ company_id: getCompanyId() });
        return all
    }

    let modelFunctions = Object.keys(model).
    filter(function (key) {
        return (!key.includes('find')||!key.includes('findAll'));
  
    }).
    reduce((cur, key) => { 
      return Object.assign(cur, { [key]: model[key] })}, {});

    return {
        ...modelFunctions,
        searchArticle,
        find,
        findAll
    };
};
