/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('contact', t => {
        t.integer("company_id").unsigned();
        t.foreign("company_id")
            .references("companies.id")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");

    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('contact', table => {
        table.dropColumn('company_id')
    })
};
