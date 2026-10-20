export function up(knex) {
  return knex.schema.createTable("login_codes", (t) => {
    t.increments("id").primary();
    t.integer("user_id").notNullable();
    t.string("code_hash").notNullable();
    t.boolean("used").defaultTo(false);
    t.timestamp("expires_at").notNullable();
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("login_codes");
}
