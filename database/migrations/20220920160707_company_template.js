/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('companies', table => {
        table.integer("invoice_template_id")
        table.integer("estimate_template_id")
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('companies', table => {
        table.dropColumn('invoice_template_id')
        table.dropColumn('estimate_template_id')
    })
};
