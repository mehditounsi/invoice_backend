/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable("companies", (t) => {
        t.integer("discount").defaultTo(1).alter()
        t.integer("article_edition").defaultTo(1).alter()
        t.integer("status").defaultTo(1).alter()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable("companies", (t) => {
        t.integer("discount").defaultTo(1).alter()
        t.integer("article_edition").defaultTo(1).alter()
        t.integer("status").defaultTo(1).alter()
    })
};
