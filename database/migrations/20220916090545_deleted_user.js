/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("deleted_users", (t) => {
        t.increments("id").primary();
        t.integer("old_id");
        t.string("login", 60).unique();
        t.string("password", 100);
        t.string("role", 15);
        t.string("name", 50);
        t.string("uid", 60);
        t.integer("signature");
        t.integer("company_id").unsigned();
        t.foreign("company_id")
            .references("companies.id")
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
        .dropTableIfExists("deleted_users")
};
