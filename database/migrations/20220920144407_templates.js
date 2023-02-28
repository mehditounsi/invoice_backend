/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable("templates", (t) => {
      t.increments("id").primary();
      t.text("template", "longtext");
      t.string("type", 100);
      t.boolean("isDefault").defaultTo(1);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists("templates")
};
