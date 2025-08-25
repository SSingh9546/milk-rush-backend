const express = require('express');
const cors = require('cors');
const { connectMySQL } = require('./src/shared/config/db');
const { setupServer, requestLogger } = require('./src/shared/helpers/serverHelper');
require('dotenv').config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Connect to database
connectMySQL();

// Setup all server routes and handlers
setupServer(app);

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 Server running on port ${PORT}
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 URL: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
⏰ Started: ${new Date().toISOString()}
    `);
}).on('error', (error) => {
    console.error('❌ Server failed to start:', error.message);
    process.exit(1);
});

module.exports = app;