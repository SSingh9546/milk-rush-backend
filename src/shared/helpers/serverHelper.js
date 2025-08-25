const isProd = process.env.NODE_ENV === 'production';

// Health endpoints
const setupHealthRoutes = (app) => {
    app.get('/health', (req, res) => {
        res.json({
            success: true,
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });

    app.get('/api', (req, res) => {
        res.json({
            success: true,
            message: 'API is running',
            version: 'v1',
            endpoints: {
                auth: '/api/v1/auth',
                farmer: '/api/v1/farmer',
                fdo: '/api/v1/fdo',
                stakeholder: '/api/v1/stakeholder'
            }
        });
    });
};

// Load API routes dynamically
const setupApiRoutes = (app) => {
    const routes = [
        { name: 'auth', file: 'auth' },
        { name: 'farmer', file: 'farmer' },
        { name: 'fdo', file: 'fdo' },
        { name: 'stakeholder', file: 'stake-holder' }
    ];
    
    routes.forEach(route => {
        try {
            const routeModule = require(`../../routes/api/v1/${route.file}`);
            app.use(`/api/v1/${route.name}`, routeModule);
        } catch (error) {
            console.warn(`⚠️ Route '${route.name}' not found:`, error.message);
        }
    });
    
    console.log('✅ Route loading completed');
};

// 404 handler
const setup404Handler = (app) => {
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Route not found',
            requestedUrl: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    });
};

// Error handler
const setupErrorHandler = (app) => {
    app.use((err, req, res, next) => {
        console.error('Error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
            error: isProd ? 'Internal Server Error' : err.message
        });
    });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
};

// Setup all server configurations
const setupServer = (app) => {
    setupHealthRoutes(app);
    setupApiRoutes(app);
    setup404Handler(app);
    setupErrorHandler(app);
};

module.exports = {
    setupServer,
    setupHealthRoutes,
    setupApiRoutes,
    setup404Handler,
    setupErrorHandler,
    requestLogger
};