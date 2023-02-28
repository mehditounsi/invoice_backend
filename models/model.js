
const { getCompanyId } = require('../helpers/context')

module.exports = ({
    knex = {},
    name = 'name',
    tableName = 'tablename',
    selectableProps = [],
    timeout = 1000,
}) => {

    const create = async (props) => {
        try {
            props.company_id = getCompanyId()
            let rs = await knex.insert(props).into(tableName).returning(selectableProps).timeout(timeout);
            if (rs && rs.length > 0) {
                return rs[0]
            }
            return null
        } catch (error) {
            console.error(error)
        }
    }

    const findAll = async () => {
        let all = await knex.select(selectableProps).from(tableName).where({ company_id: getCompanyId() }).timeout(timeout);
        return all
    }

    
    const find = async (filters) => {
        let find =  await knex.select(selectableProps).from(tableName).where(filters).timeout(timeout);
        return find 
    }

    const findOne = async (filters) =>
        await find(filters).then((results) => {
            if (!Array.isArray(results)) return results;

            return results[0];
        });

    const findByName = async (role) => {
        role.company_id = getCompanyId()
        return await knex.select(selectableProps).from(tableName).where({ role }).timeout(timeout);
    };

    const findById = async (id) => {
        let rs = await knex.select(selectableProps).from(tableName).where({ id }).timeout(timeout);
        if (rs && rs.length > 0 && rs[0].company_id == getCompanyId()) {
            return rs[0]
        }
        return null
    };

    const update = async (id, props) => {
        delete props.id;
        let condition = {
            id: id,
            company_id: getCompanyId()
        }
        props.company_id = undefined
        let rs = await knex
            .update(props)
            .from(tableName)
            .where(condition)
            .returning(selectableProps)
            .timeout(timeout);
            if (rs && rs.length > 0) {
                return rs[0]
            }
            return null
    };

    const destroy = async (id) => {
        let condition = {
            id: id,
            company_id: getCompanyId()
        }
        let rs = await knex.del().from(tableName).where(condition).returning(selectableProps).timeout(timeout);
        if (rs && rs.length > 0) {
            return rs[0]
        }
        return null
    };
    return {
        name,
        tableName,
        selectableProps,
        timeout,
        create,
        findAll,
        find,
        findOne,
        findById,
        findByName,
        update,
        destroy
    };
}
