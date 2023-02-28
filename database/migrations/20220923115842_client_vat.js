/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable("clients", (t)=>{
        t.boolean("vat").defaultTo(true).alter()
      })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable("clients", (t) => {
        t.boolean("vat").defaultTo(true).alter()
      })
};
