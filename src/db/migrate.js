const pool = require('./client');

async function migrate() {
  // Create schema if it doesn't exist
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.DB_SCHEMA || 'public'}`);

  // TODO: add your service tables here
  await pool.query(`
    CREATE TABLE IF NOT EXISTS example_items (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('Migration complete');
}

module.exports = migrate;
