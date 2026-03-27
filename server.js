const express = require('express');
const { Client } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/db-check', async (req, res) => {
  const schema = process.env.DB_SCHEMA;
  const client = new Client({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT || 5432,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    if (schema) {
      await client.query(`SET search_path TO ${schema}`);
    }
    await client.query('SELECT 1');
    await client.end();
    res.json({
      ok: true,
      message: 'Connected successfully',
      host:     process.env.DB_HOST || '(not set)',
      database: process.env.DB_NAME || '(not set)',
      schema:   schema || '(not set)',
    });
  } catch (err) {
    try { await client.end(); } catch {}
    res.status(500).json({
      ok: false,
      message: err.message,
      host:     process.env.DB_HOST || '(not set)',
      database: process.env.DB_NAME || '(not set)',
      schema:   schema || '(not set)',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Service running on port ${PORT}`);
});
