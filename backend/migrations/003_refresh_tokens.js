export function up(knex) {
  return knex.schema.createTable("refresh_tokens", (t) => {
    t.increments("id").primary();
    t.integer("user_id").notNullable();
    t.string("email");
    t.string("token_hash").notNullable();
    t.timestamp("expires_at").notNullable();
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("refresh_tokens");
}
