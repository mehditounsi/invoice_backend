const genericModel = require('./model');

const name = 'User';
const tableName = 'users';
const selectableProps = [
    'id',
    'login',
    'role',
    'name',
    'uid',
    'company_id',
    'signature',
    'configuration'
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
        if (rs && rs.length > 0){
            return rs[0]
        }
        return null
    };
    
    const find = async (filters) => {
        await knex.select(selectableProps).from(tableName).where(filters , 'like' ,'%rowlikeme%');
      }

    const findByUid = async (uid) => {
        let rs = await knex.select(selectableProps).from(tableName).where({ uid : uid })
        if (rs && rs.length > 0){
            return rs[0]
        }
        return null
    };


    const findByLogin = async (login) => {
        let rs = await knex.select(selectableProps).from(tableName).where({ login : login })
        if (rs && rs.length > 0){
            return rs[0]
        }
        return null
    };

    const findAll = async () => {
        let allUsers = await knex.select(selectableProps).from(tableName);
        return allUsers
    }

    const findAllUsers = async () => {
        try {
            let props = [
                "users.id AS user_id",
                "users.login AS user_login",
                "users.role AS role",
                "users.name AS username",
                "companies.id AS company_id",
                "companies.name AS company_name",
                "companies.fax AS company_fax",
                "companies.telephone AS company_telephone",
                "companies.status AS company_status",
                "companies.address AS company_address",
            ]
            let allUsers = await knex.select(props).from(tableName)
                .leftJoin("companies", "companies.id", "=", "users.company_id")
            return allUsers
        } catch (error) {
            console.log(error);
        }
    }

    const findByIdForAdmin = async (id) => {
        let rs = await knex.select(selectableProps).from(tableName).where({ id });
        if (rs && rs.length > 0) {
            return rs[0]
        }
        return null
    };

    let modelFunctions = Object.keys(model).
    filter(function (key) {
      return (!key.includes('create')|| !key.includes('find'));

    }).
    reduce((cur, key) => {
      return Object.assign(cur, { [key]: model[key] })
    }, {});


    return {
        ...modelFunctions,
        findByUid,
        findByLogin,
        create,
        find,
        findAll,
        findByIdForAdmin,
        findAllUsers
    };
};
