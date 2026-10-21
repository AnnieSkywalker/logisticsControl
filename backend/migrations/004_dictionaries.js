export function up(knex) {
  const dictionary = (name, extra = (t) => t) =>
    knex.schema.createTable(name, (t) => {
      t.increments("id").primary();
      extra(t);
      t.boolean("is_active").defaultTo(true);
      t.integer("sort_order").defaultTo(0);
      t.timestamp("created_at").defaultTo(knex.fn.now());
    });

  return dictionary("legal_entities", (t) => {
    t.string("name").notNullable();
  })
    .then(() => dictionary("loading_sites", (t) => {
      t.string("name").notNullable();
    }))
    .then(() => dictionary("destination_sites", (t) => {
      t.string("name").notNullable();
    }))
    .then(() => dictionary("fractions", (t) => {
      t.string("name").notNullable();
    }))
    .then(() => dictionary("volumes", (t) => {
      t.float("value").notNullable();
      t.string("unit").defaultTo("т");
    }))
    .then(() => dictionary("vehicles", (t) => {
      t.string("number").notNullable();
    }));
}

export function down(knex) {
  return knex.schema
    .dropTableIfExists("vehicles")
    .dropTableIfExists("volumes")
    .dropTableIfExists("fractions")
    .dropTableIfExists("destination_sites")
    .dropTableIfExists("loading_sites")
    .dropTableIfExists("legal_entities");
}
