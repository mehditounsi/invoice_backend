/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable("vat", (t) => {
        t.decimal("vat", 10, 4).alter()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable("vat", (t) => {
        t.decimal("vat", 10, 4).alter()
    })
};
