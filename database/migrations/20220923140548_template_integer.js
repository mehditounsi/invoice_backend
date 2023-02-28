/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable("templates", (t) => {
        t.integer("isDefault").defaultTo(1).alter()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable("templates", (t) => {
        t.integer("isDefault").defaultTo(1).alter()
    })
};
