/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex)  {
    return knex.schema.alterTable('companies', table => {
        table.boolean('status').defaultTo(1).alter();
      })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('companies', table => {
      table.boolean("status").defaultTo(1).alter()
      })
};
