export function up(knex) {
  return knex.schema
    .createTable("users", (t) => {
      t.increments("id").primary();
      t.string("email").unique().notNullable();
      t.string("password_hash").notNullable();
      t.string("role").defaultTo("admin");
      t.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("settings", (t) => {
      t.increments("id").primary();
      t.string("key").unique().notNullable();
      t.text("value");
      t.timestamp("updated_at").defaultTo(knex.fn.now());
    });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("settings").dropTableIfExists("users");
}
