const path = require('path');
const isProd = process.env.NODE_ENV === 'production';

// Health endpoints
const setupHealthRoutes = (app) => {
    app.get('/health', (req, res) => {
        res.json({
            success: true,
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
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

// Load API routes dynamically with enhanced debugging
const setupApiRoutes = (app) => {
    const routes = [
        { name: 'auth', file: 'auth' },
        { name: 'farmer', file: 'farmer' },
        { name: 'fdo', file: 'fdo' },
        { name: 'stakeholder', file: 'stake-holder' }
    ];
    
    console.log('🚀 Starting to load API routes...');
    console.log(`📍 Current working directory: ${process.cwd()}`);
    console.log(`📍 __dirname: ${__dirname}`);
    
    let successCount = 0;
    
    routes.forEach(route => {
        try {
            console.log(`\n📁 Loading route: ${route.name} from file: ${route.file}`);
            
            // Try different path approaches
            const routePath = path.resolve(__dirname, `../../routes/api/v1/${route.file}.js`);
            console.log(`📍 Resolved path: ${routePath}`);
            
            const routeModule = require(`../../routes/api/v1/${route.file}`);
            
            // Validate the module
            if (!routeModule) {
                console.error(`❌ Route module '${route.name}' is null or undefined`);
                return;
            }
            
            console.log(`📋 Route module info for '${route.name}':`);
            console.log(`   Type: ${typeof routeModule}`);
            console.log(`   Constructor: ${routeModule.constructor.name}`);
            console.log(`   Has 'use' method: ${typeof routeModule.use === 'function'}`);
            console.log(`   Has 'stack' property: ${!!routeModule.stack}`);
            
            if (typeof routeModule.use !== 'function') {
                console.error(`❌ Route module '${route.name}' is not a valid Express router`);
                console.log(`   Available methods:`, Object.getOwnPropertyNames(routeModule));
                return;
            }
            
            // Mount the route
            const mountPath = `/api/v1/${route.name}`;
            app.use(mountPath, routeModule);
            successCount++;
            
            console.log(`✅ Successfully mounted '${route.name}' at '${mountPath}'`);
            
            // Log route details if available
            if (routeModule.stack && routeModule.stack.length > 0) {
                console.log(`   📊 Routes in ${route.name}: ${routeModule.stack.length}`);
                routeModule.stack.forEach((layer, index) => {
                    if (layer.route) {
                        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
                        console.log(`     ${methods} ${layer.route.path}`);
                    }
                });
            }
            
        } catch (error) {
            console.error(`❌ Failed to load route '${route.name}':`, error.message);
            console.error(`   Error code: ${error.code}`);
            console.error(`   Stack: ${error.stack.split('\n')[0]}`);
            
            // Try to provide more specific error info
            if (error.code === 'MODULE_NOT_FOUND') {
                console.error(`   💡 Suggestion: Check if file exists at: routes/api/v1/${route.file}.js`);
            }
        }
    });
    
    console.log(`\n📈 Route loading summary: ${successCount}/${routes.length} routes loaded successfully`);
    
    // Debug: List all mounted routes
    console.log('\n📋 All registered routes in app:');
    if (app._router && app._router.stack) {
        let routeCount = 0;
        app._router.stack.forEach((layer, index) => {
            if (layer.route) {
                const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
                console.log(`   ${methods} ${layer.route.path}`);
                routeCount++;
            } else if (layer.name === 'router' && layer.regexp) {
                const pathRegex = layer.regexp.source;
                let path = pathRegex
                    .replace(/\\\//g, '/')
                    .replace(/\$.*/, '')
                    .replace(/^\^/, '')
                    .replace(/\?\(\?\=.*$/, '');
                
                if (path === '') path = '/';
                console.log(`   ROUTER mounted at: ${path}`);
                routeCount++;
            }
        });
        console.log(`   Total registered: ${routeCount} routes/routers`);
    }
    
    console.log('🏁 Dynamic route loading completed\n');
    
    return successCount;
};

// Manual route loading as fallback
const setupApiRoutesManual = (app) => {
    console.log('🔧 Starting manual route loading...');
    
    const routeConfigs = [
        { name: 'auth', path: '/api/v1/auth', file: '../../routes/api/v1/auth' },
        { name: 'farmer', path: '/api/v1/farmer', file: '../../routes/api/v1/farmer' },
        { name: 'fdo', path: '/api/v1/fdo', file: '../../routes/api/v1/fdo' },
        { name: 'stakeholder', path: '/api/v1/stakeholder', file: '../../routes/api/v1/stake-holder' }
    ];
    
    let successCount = 0;
    
    routeConfigs.forEach(config => {
        try {
            console.log(`📁 Manually loading ${config.name} route...`);
            
            const routeModule = require(config.file);
            
            if (!routeModule || typeof routeModule.use !== 'function') {
                console.error(`❌ Invalid router module for ${config.name}`);
                return;
            }
            
            app.use(config.path, routeModule);
            successCount++;
            console.log(`✅ Manually mounted ${config.name} at ${config.path}`);
            
        } catch (error) {
            console.error(`❌ Manual loading failed for ${config.name}:`, error.message);
        }
    });
    
    console.log(`🏁 Manual route loading completed: ${successCount}/4 routes loaded\n`);
    
    return successCount;
};

// Test route loading without mounting
const testRouteFiles = () => {
    console.log('🧪 Testing route file accessibility...');
    
    const routes = ['auth', 'farmer', 'fdo', 'stake-holder'];
    
    routes.forEach(routeName => {
        try {
            const routePath = path.resolve(__dirname, `../../routes/api/v1/${routeName}.js`);
            console.log(`🔍 Testing ${routeName}: ${routePath}`);
            
            // Check if file exists
            const fs = require('fs');
            const exists = fs.existsSync(routePath);
            console.log(`   File exists: ${exists}`);
            
            if (exists) {
                // Try to require it
                const routeModule = require(`../../routes/api/v1/${routeName}`);
                console.log(`   Can require: ✅`);
                console.log(`   Type: ${typeof routeModule}`);
                console.log(`   Is router: ${typeof routeModule.use === 'function'}`);
            }
            
        } catch (error) {
            console.log(`   Error: ${error.message}`);
        }
    });
    
    console.log('🧪 Route file testing completed\n');
};

// 404 handler
const setup404Handler = (app) => {
    app.use((req, res) => {
        console.log(`🚫 404 - Route not found: ${req.method} ${req.originalUrl}`);
        res.status(404).json({
            success: false,
            message: 'Route not found',
            requestedUrl: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString(),
            availableEndpoints: {
                health: '/health',
                api: '/api',
                auth: '/api/v1/auth',
                farmer: '/api/v1/farmer',
                fdo: '/api/v1/fdo',
                stakeholder: '/api/v1/stakeholder'
            }
        });
    });
};

// Error handler
const setupErrorHandler = (app) => {
    app.use((err, req, res, next) => {
        console.error('🚨 Server Error:', err.message);
        console.error('📍 Request:', req.method, req.originalUrl);
        console.error('🔍 Stack:', err.stack);
        
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
            error: isProd ? 'Internal Server Error' : err.message,
            timestamp: new Date().toISOString()
        });
    });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📝 ${timestamp} - ${req.method} ${req.url}`);
    
    // Log headers for debugging (only in development)
    if (!isProd) {
        console.log(`   User-Agent: ${req.get('User-Agent') || 'N/A'}`);
        console.log(`   Content-Type: ${req.get('Content-Type') || 'N/A'}`);
    }
    
    next();
};

// Setup all server configurations with intelligent fallback
const setupServer = (app) => {
    console.log('🎯 Setting up server...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    
    // Test route files first
    testRouteFiles();
    
    // Setup health routes (these always work)
    setupHealthRoutes(app);
    console.log('✅ Health routes configured');
    
    // Try dynamic route loading first
    const dynamicSuccess = setupApiRoutes(app);
    
    // If dynamic loading failed, try manual loading
    if (dynamicSuccess === 0) {
        console.log('⚠️ Dynamic loading failed, trying manual loading...');
        setupApiRoutesManual(app);
    }
    
    // Setup error handling (these go last)
    setup404Handler(app);
    setupErrorHandler(app);
    console.log('✅ Error handlers configured');
    
    console.log('🎉 Server setup completed successfully!\n');
};

module.exports = {
    setupServer,
    setupHealthRoutes,
    setupApiRoutes,
    setupApiRoutesManual,
    testRouteFiles,
    setup404Handler,
    setupErrorHandler,
    requestLogger
};