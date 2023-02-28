/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("notifications", (t) => {
        t.increments("id").primary();
        t.string("type").defaultTo("info");
        t.string("message", 600);
        t.integer("status").defaultTo(1);
        t.dateTime("start_date");
        t.dateTime("end_date");
        t.integer("user_id").unsigned();
        t.foreign("user_id")
          .references("users.id")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        t.integer("company_id").unsigned();
        t.foreign("company_id")
          .references("companies.id")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists("notifications")
};
