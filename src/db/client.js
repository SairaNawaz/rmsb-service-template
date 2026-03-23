const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  user:     process.env.DB_USER     || 'admin',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME     || 'rmsb_db',
  // TODO: each service uses its own schema — set via DB_SCHEMA env var
  options:  `--search_path=${process.env.DB_SCHEMA || 'public'}`,
});

pool.on('error', (err) => console.error('DB pool error:', err.message));

module.exports = pool;
