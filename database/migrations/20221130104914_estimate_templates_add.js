/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex) {
    return knex.schema.table('estimates', table => {
        table.integer("template_id_fr")
        table.integer("template_id_ar")
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('estimates', table => {
        table.dropColumn('template_id_fr')
        table.dropColumn('template_id_ar')
    })
};
