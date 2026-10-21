export function up(knex) {
  return knex.schema.createTable("shipment_orders", (t) => {
    t.increments("id").primary();
    t.string("order_number").unique().notNullable();
    t.integer("legal_entity_id").notNullable();
    t.string("order_at").notNullable();
    t.integer("loading_site_id").notNullable();
    t.integer("destination_site_id").notNullable();
    t.integer("fraction_id").notNullable();
    t.integer("volume_id").notNullable();
    t.integer("vehicle_id").notNullable();
    t.text("comment");
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("shipment_orders");
}
