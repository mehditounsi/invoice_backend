/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable("contact", (t) => {
            t.increments("id").primary();
            t.date("date").defaultTo(knex.fn.now());
            t.text("message", "longtext");
            t.integer("attachment");
            t.string("title", 100);
            t.integer("user_id").unsigned();
            t.foreign("user_id")
                .references("users.id")
                .onDelete("CASCADE")
                .onUpdate("CASCADE");

        })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists("contact")
};
