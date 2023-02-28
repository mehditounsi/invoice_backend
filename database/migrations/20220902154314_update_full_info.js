/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable("estimates", (t) => {
        t.string("full_info", 100).alter()
      })

      .alterTable("invoices", (t) => {
        t.string("full_info", 100).alter()
      })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable("estimates", (t) => {
        t.string("full_info", 45).alter()
      })

      .alterTable("invoices", (t) => {
        t.string("full_info", 45).alter()
      })
};
