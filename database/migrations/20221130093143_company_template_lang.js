/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex) {
    return knex.schema.table('companies', table => {
        table.integer("invoice_template_id_fr")
        table.integer("estimate_template_id_fr")
        table.integer("invoice_template_id_ar")
        table.integer("estimate_template_id_ar")
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('companies', table => {
        table.dropColumn('invoice_template_id_fr')
        table.dropColumn('estimate_template_id_fr')
        table.dropColumn('invoice_template_id_ar')
        table.dropColumn('estimate_template_id_ar')
    })
};
