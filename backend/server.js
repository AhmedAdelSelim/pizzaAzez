const cluster = require('cluster');
const os = require('os');

// ── Master process ────────────────────────────────────────────────────────────
if (cluster.isPrimary) {
    const numWorkers = process.env.WEB_CONCURRENCY
        ? parseInt(process.env.WEB_CONCURRENCY)
        : os.cpus().length;

    console.log(`[master] PID ${process.pid} — forking ${numWorkers} workers`);

    // Connect DB once in master so the cleanup job can run here only
    const connectDB = require('./src/config/db');
    connectDB();

    const { startCleanupJob } = require('./src/services/cleanupService');
    startCleanupJob();

    // Fork workers
    for (let i = 0; i < numWorkers; i++) cluster.fork();

    // Restart a worker if it crashes
    cluster.on('exit', (worker, code, signal) => {
        console.log(`[master] Worker ${worker.process.pid} died (${signal || code}) — restarting`);
        cluster.fork();
    });

    // Fan-out SSE IPC messages: any worker → master → all workers
    cluster.on('message', (_sender, msg) => {
        if (msg?.type !== 'sse') return;
        for (const id in cluster.workers) {
            const w = cluster.workers[id];
            if (w) w.send(msg);
        }
    });

// ── Worker process ────────────────────────────────────────────────────────────
} else {
    const fastify = require('fastify')({ logger: true });
    const connectDB = require('./src/config/db');
    const config = require('./src/config');
    const routes = require('./src/routes');

    fastify.register(require('@fastify/cors'), { origin: true });
    fastify.register(require('@fastify/jwt'), { secret: config.JWT_SECRET });
    fastify.register(routes);

    connectDB();

    fastify.listen({ port: config.PORT, host: '0.0.0.0' })
        .then(() => console.log(`[worker ${process.pid}] listening on port ${config.PORT}`))
        .catch(err => { console.error(err); process.exit(1); });
}
