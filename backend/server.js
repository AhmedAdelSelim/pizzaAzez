const fastify = require('fastify')({ logger: true });
const connectDB = require('./src/config/db');
const config = require('./src/config');
const routes = require('./src/routes');

// Register plugins
fastify.register(require('@fastify/cors'), { origin: true });
fastify.register(require('@fastify/jwt'), { secret: config.JWT_SECRET });

// Register routes
fastify.register(routes);

// --- Initialize Supabase ---
connectDB();

// Run the server
const start = async () => {
    try {
        await fastify.listen({ port: config.PORT, host: '0.0.0.0' });
        console.log(`Server is running on http://0.0.0.0:${config.PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
