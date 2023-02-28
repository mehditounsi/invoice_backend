/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable("attachments", (t) => {
        t.specificType("attachment" ,"bytea").alter()

      })

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable("attachments", (t) => {
        t.binary("attachment").alter()
      })
};
