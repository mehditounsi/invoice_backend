const genericModel = require('./model');
const { getCompanyId } = require('../helpers/context')

const name = 'Contact';
const tableName = 'contact';
const selectableProps = [
    'id',
    'date',
    'message',
    'attachment',
    'title',
    'user_id',
    'company_id',
    'status'
];

module.exports = (knex) => {
    const model = genericModel({
        knex,
        name,
        tableName,
        selectableProps,
    });

    const findAll = async () => {
        let allContact = await knex.select(selectableProps).from(tableName);
        return allContact
    }

    const findAllContact = async () => {
        try {
            let props = [
                "contact.id AS contact_id",
                "contact.date AS contact_date",
                "contact.message AS contact_message",
                "contact.title AS contact_title",
                "contact.status AS contact_status",
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
                "attachments.id AS attachment_id",
            ]
            let allContact = await knex.select(props).from(tableName)
                .leftJoin("companies", "companies.id", "=", "contact.company_id")
                .leftJoin("users", "users.id", "=", "contact.user_id")
                .leftJoin("attachments", "attachments.id", "=", "contact.attachment");
            return allContact
        } catch (error) {
            console.log(error);
        }
    }


    const findOneContact = async (id) => {
        try {
            let props = [
                "contact.id AS contact_id",
                "contact.date AS contact_date",
                "contact.message AS contact_message",
                "contact.title AS contact_title",
                "contact.status AS contact_status",
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
                "attachments.id AS attachment_id",
                "attachments.attachment AS file",
            ]
            let Contact = await knex.select(props).from(tableName).where('contact.id' , id )
                .leftJoin("companies", "companies.id", "=", "contact.company_id")
                .leftJoin("users", "users.id", "=", "contact.user_id")
                .leftJoin("attachments", "attachments.id", "=", "contact.attachment");
            return Contact
        } catch (error) {
            console.log(error);
        }
    }

    const findById = async (id) => {
        let rs = await knex.select(selectableProps).from(tableName).where({ id })
        if (rs && rs.length > 0) {
            return rs[0]
        }
        return null
    };

    const update = async (id, props) => {
        delete props.id;
        let rs = await knex
            .update(props)
            .from(tableName)
            .where({ id })
            .returning(selectableProps)

        if (rs && rs.length > 0) {
            return rs[0]
        }
        return null
    };

    let modelFunctions = Object.keys(model).
        filter(function (key) {
            return (!key.includes('findById') || !key.includes('update') || !key.includes('findById'));

        }).
        reduce((cur, key) => {
            return Object.assign(cur, { [key]: model[key] })
        }, {});

    return {
        ...modelFunctions,
        findAll,
        update,
        findById,
        findAllContact,
        findOneContact
    };
};
