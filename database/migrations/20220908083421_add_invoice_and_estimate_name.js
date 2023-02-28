/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex)  {
    return knex.schema.table('companies', table => {
        table.string('invoice_name', 128);
        table.string('estimate_name', 128);
      })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('companies', table => {
        table.dropColumn('invoice_name');
        table.dropColumn('estimate_name');
      })
};
