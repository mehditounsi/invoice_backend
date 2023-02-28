/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable("clients", (t)=>{
        t.integer("vat").defaultTo(1).alter()
        t.integer("timbre").defaultTo(1).alter()
      })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable("clients", (t) => {
        t.integer("vat").defaultTo(1).alter()
        t.integer("timbre").defaultTo(1).alter()
      })
};
