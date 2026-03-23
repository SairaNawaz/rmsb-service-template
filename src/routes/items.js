// TODO: rename this file and update routes for your service
const express = require('express');
const router = express.Router();
const pool = require('../db/client');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM example_items ORDER BY created_at ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO example_items (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM example_items WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
