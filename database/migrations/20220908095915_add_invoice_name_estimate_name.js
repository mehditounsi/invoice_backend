/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex)  {
    return knex.schema.alterTable('companies', table => {
        table.string('invoice_name', 8).alter();
        table.string('estimate_name', 8).alter();
      })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('companies', table => {
        table.dropColumn('invoice_name');
        table.dropColumn('estimate_name');
      })
};
