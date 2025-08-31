require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { connectMySQL } = require('./src/shared/config/db');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// health
app.get('/health', (_req, res) =>
  res.json({ ok: true, env: NODE_ENV, ts: new Date().toISOString(), uptime: process.uptime() })
);

// auto-mount all v1 routes
(() => {
  const v1Dir = path.join(__dirname, 'src', 'routes', 'api', 'v1');
  if (!fs.existsSync(v1Dir)) {
    console.warn('⚠️ routes dir not found:', v1Dir);
    return;
  }
  fs.readdirSync(v1Dir)
    .filter((f) => f.endsWith('.js'))
    .forEach((f) => {
      const mount = `/api/v1/${path.basename(f, '.js')}`;
      app.use(mount, require(path.join(v1Dir, f)));
      console.log(`➡️ Mounted ${mount}`);
    });
})();

// Root route (homepage for your backend)
app.get('/', (_req, res) => {
  res.json({
    ok: true,
    msg: '🚀 Backend is live and running!',
    env: NODE_ENV,
    time: new Date().toISOString()
  });
});

// 404 + error
app.use((req, res) => res.status(404).json({ ok: false, msg: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('💥', err);
  res.status(500).json({ ok: false, msg: 'Internal error', err: NODE_ENV === 'production' ? undefined : err.message });
});

(async () => {
  try {
    await connectMySQL?.();
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`
🚀 Server running on port ${PORT}
📍 Environment: ${NODE_ENV}
🌐 URL: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
⏰ Started: ${new Date().toISOString()}
    `);
  });

  server.on('error', (error) => {
    console.error('❌ Server failed to start:', error.message);
    process.exit(1);
  });
})();

module.exports = app;
