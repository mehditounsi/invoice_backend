/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("companies", (t) => {
      t.increments("id").primary();
      t.string("name", 100);
      t.string("address", 100);
      t.string("telephone", 15);
      t.string("fax", 15);
      t.string("rib", 40);
      t.integer("logo");
      t.string("tax_identification", "30");
      t.json("config");
      t.decimal("timbre", 10, 3);
      t.integer("digits");
      t.boolean("discount");
      t.boolean("article_edition");
      t.text("footer", "longtext");
    })

    .createTable("users", (t) => {
      t.increments("id").primary();
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

    .createTable("clients", (t) => {
      t.increments("id").primary();
      t.string("name", 60).notNullable();
      t.string("tax_identification", 20);
      t.string("address", 60);
      t.string("email", 60);
      t.string("telephone", 15);
      t.string("fax", 15);
      t.boolean("timbre");
      t.boolean("vat");
      t.integer("company_id").unsigned();
      t.foreign("company_id")
        .references("companies.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    })

    .createTable("attachments", (t) => {
      t.increments("id").primary();
      t.binary("attachment");
      t.string("filename", 45);
      t.integer("company_id").unsigned();
      t.foreign("company_id")
        .references("companies.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    })

    .createTable("vat", (t) => {
      t.increments("id").primary();
      t.decimal("vat", 10, 3);
      t.integer("company_id").unsigned();
      t.foreign("company_id")
        .references("companies.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    })

    .createTable("articles", (t) => {
      t.increments("id").primary();
      t.string("code", 60).notNullable();
      t.text("article", "mediumtext");
      t.decimal("price", 10, 3);
      t.integer("vat").unsigned();
      t.integer("status");
      t.integer("company_id").unsigned();
      t.foreign("vat")
        .references("vat.id")
        .onDelete("RESTRICT")
        .onUpdate("RESTRICT");
      t.foreign("company_id")
        .references("companies.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    })

    .createTable("estimates", (t) => {
      t.increments("id").primary();
      t.string("number", 60).notNullable();
      t.dateTime("date").defaultTo(knex.fn.now());
      t.dateTime("validation_date");
      t.integer("signature");
      t.dateTime("signature_date");
      t.decimal("timbre", 10, 3);
      t.json("client");
      t.json("company");
      t.decimal("discount", 10, 3);
      t.decimal("total_ht", 10, 3);
      t.decimal("total_vat", 10, 3);
      t.decimal("total_price", 10, 3);
      t.decimal("rate", 10, 3);
      t.boolean("status");
      t.integer("num_interne");
      t.string("full_info", 45);
      t.integer("company_id").unsigned();
      t.integer("client_id").unsigned();
      t.foreign("company_id")
        .references("companies.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      t.foreign("client_id")
        .references("clients.id")
        .onDelete("RESTRICT")
        .onUpdate("RESTRICT");
    })

    .createTable("estimates_line", (t) => {
      t.increments("id").primary();
      t.string("code", 60).notNullable();
      t.text("article", "mediumtext");
      t.decimal("price", 10, 3);
      t.decimal("vat", 6, 3);
      t.decimal("quantity", 10, 3);
      t.decimal("discount", 10, 3);
      t.decimal("total", 10, 3);
      t.integer("company_id").unsigned();
      t.integer("estimate_id").unsigned();
      t.integer("article_id").unsigned();
      t.foreign("company_id")
        .references("companies.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      t.foreign("estimate_id")
        .references("estimates.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      t.foreign("article_id")
        .references("articles.id")
        .onDelete("RESTRICT")
        .onUpdate("RESTRICT");
    })

   

    .createTable("invoices", (t) => {
      t.increments("id").primary();
      t.string("number", 60).notNullable();
      t.dateTime("date").defaultTo(knex.fn.now());
      t.integer("signature");
      t.dateTime("signature_date");
      t.decimal("timbre", 10, 3);
      t.json("client");
      t.json("company");
      t.decimal("discount", 10, 3);
      t.decimal("total_ht", 10, 3);
      t.decimal("total_vat", 10, 3);
      t.decimal("total_price", 10, 3);
      t.decimal("rate", 10, 3);
      t.boolean("status");
      t.integer("num_interne");
      t.string("full_info", 45);
      t.integer("company_id").unsigned();
      t.integer("client_id").unsigned();
      t.foreign("company_id")
        .references("companies.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      t.foreign("client_id")
        .references("clients.id")
        .onDelete("RESTRICT")
        .onUpdate("RESTRICT");
    })

    .createTable("invoice_line", (t) => {
      t.increments("id").primary();
      t.string("code", 60).notNullable();
      t.text("article", "mediumtext");
      t.decimal("price", 10, 3);
      t.decimal("vat", 6, 3);
      t.decimal("quantity", 10, 3);
      t.decimal("discount", 10, 3);
      t.decimal("total", 10, 3);
      t.integer("company_id").unsigned();
      t.integer("invoice_id").unsigned();
      t.integer("article_id").unsigned();
      t.foreign("company_id")
        .references("companies.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      t.foreign("invoice_id")
        .references("invoices.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      t.foreign("article_id")
        .references("articles.id")
        .onDelete("RESTRICT")
        .onUpdate("RESTRICT");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("attachments")
    .dropTableIfExists("invoice_line")
    .dropTableIfExists("estimates_line")
    .dropTableIfExists("invoices")
    .dropTableIfExists("estimates")
    .dropTableIfExists("clients")
    .dropTableIfExists("users")
    .dropTableIfExists("articles")
    .dropTableIfExists("vat")
    .dropTableIfExists("companies");
};
