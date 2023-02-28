const genericModel = require('./model');

const name = 'Notification';
const tableName = 'notifications';
const selectableProps = [
    'id',
    'type',
    'message',
    'status',
    'start_date',
    'end_date',
    'user_id',
    'company_id',
];

module.exports = (knex) => {
    const model = genericModel({
        knex,
        name,
        tableName,
        selectableProps,
    });

    const findAll = async () => {
        let allNotifs = await knex.select(selectableProps).from(tableName);
        return allNotifs
    }

    const findAllNotifications = async () => {
        try {
            let props = [
                "notifications.id AS notification_id",
                "notifications.start_date AS start_date",
                "notifications.end_date AS end_date",
                "notifications.message AS message",
                "notifications.type AS type",
                "notifications.status AS notification_status",
                "companies.id AS company_id",
                "companies.name AS company_name",
                "companies.fax AS company_fax",
                "companies.telephone AS company_telephone",
                "companies.status AS company_status",
                "companies.address AS company_address",
                "users.id AS user_id",
                "users.name AS username",
                "users.login AS email",
                "users.role AS role",
            ]
            let allNotifications = await knex.select(props).from(tableName)
                .leftJoin("companies", "companies.id", "=", "notifications.company_id")
                .leftJoin("users", "users.id", "=", "notifications.user_id")
            return allNotifications
        } catch (error) {
            console.log(error);
        }
    }

    const update = async (id, props) => {
        try {
            delete props.id;
            let properties = [
                "notifications.id AS notification_id",
                "notifications.start_date AS start_date",
                "notifications.end_date AS end_date",
                "notifications.message AS message",
                "notifications.type AS type",
                "notifications.status AS notification_status",
                "notifications.user_id AS user_id",
                "notifications.company_id AS company_id",
            ]
            let rs = await knex
                .update(props)
                .from(tableName)
                .where({ id })
                .returning(properties)
    
            if (rs && rs.length > 0) {
                return rs[0]
            }
            return null
        } catch (error) {
            console.error(error)
        }
    };

    const create = async (props) => {
        try {
            let properties = [
                "notifications.id AS notification_id",
                "notifications.start_date AS start_date",
                "notifications.end_date AS end_date",
                "notifications.message AS message",
                "notifications.type AS type",
                "notifications.status AS notification_status",
                "notifications.user_id AS user_id",
                "notifications.company_id AS company_id",
            ]
            let rs = await knex.insert(props).into(tableName).returning(properties);
            if (rs && rs.length > 0) {
                return rs[0]
            }
            return null
        } catch (error) {
            console.error(error)
        }
    }

    const findById = async (id) => {
        let rs = await knex.select(selectableProps).from(tableName).where({ id });
        if (rs && rs.length > 0) {
            return rs[0]
        }
        return null
    };

    const destroy = async (id) => {
        let rs = await knex.del().from(tableName).where({id}).returning(selectableProps);
        if (rs && rs.length > 0) {
            return rs[0]
        }
        return null
    };

    let modelFunctions = Object.keys(model).
        filter(function (key) {
            return (!key.includes('findAll') || !key.includes('update') || !key.includes('create')|| !key.includes('findById')|| !key.includes('destroy'));
        }).reduce((cur, key) => {
            return Object.assign(cur, { [key]: model[key] })
        }, {});

    return {
        ...modelFunctions,
        findAll,
        update,
        create,
        findById,
        destroy,
        findAllNotifications
    };
};
