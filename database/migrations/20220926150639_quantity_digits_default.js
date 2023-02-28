/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable("companies", (t) => {
        t.integer("quantity_digits").defaultTo(0).alter()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable("companies", (t) => {
        t.integer("quantity_digits").defaultTo(0).alter()
    })
};
