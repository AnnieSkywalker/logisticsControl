export default {
  client: "better-sqlite3",
  connection: {
    filename: "./data/db.sqlite",
  },
  useNullAsDefault: true,
  migrations: {
    directory: "./migrations",
  },
  seeds: {
    directory: "./seeds",
  },
};
