/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable("invoices", (t)=>{
    t.date("date").defaultTo(knex.fn.now()).alter()
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable("invoices", (t) => {
      t.date("date").defaultTo(knex.fn.now()).alter()
      })
};
