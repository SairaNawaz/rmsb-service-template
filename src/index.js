require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const migrate = require('./db/migrate');

// TODO: import your route files
const itemsRouter = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 3001;

// TODO: update SERVICE_NAME to match your service's path_prefix (e.g. 's2', 'hr', 'finance')
const SERVICE_NAME = process.env.SERVICE_NAME || 'svc';

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: SERVICE_NAME });
});

// TODO: mount your routes here
// Gateway strips the path_prefix before forwarding, so routes start from /
app.use('/items', itemsRouter);

// Serve built frontend (production — public/ folder built by Dockerfile)
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

async function start() {
  await migrate();
  app.listen(PORT, () => console.log(`${SERVICE_NAME} running on port ${PORT}`));
}

start();
