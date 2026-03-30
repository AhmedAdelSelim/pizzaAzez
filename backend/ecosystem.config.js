module.exports = {
    apps: [
        {
            name: 'pizzaazez-api',
            script: 'server.js',

            // "fork" mode — clustering is handled by the native cluster module
            // inside server.js, so PM2 just manages the single master process.
            exec_mode: 'fork',
            instances: 1,

            // Automatically restart if the process exceeds 500 MB RAM
            max_memory_restart: '500M',

            // Expose CPU count to the app so server.js knows how many workers to fork
            env: {
                NODE_ENV: 'production',
                WEB_CONCURRENCY: require('os').cpus().length,
            },

            env_development: {
                NODE_ENV: 'development',
                WEB_CONCURRENCY: 2, // fewer workers in dev
            },

            // Logging
            out_file: './logs/out.log',
            error_file: './logs/error.log',
            merge_logs: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss',

            // Graceful restart: wait for in-flight requests to finish (ms)
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000,
        },
    ],
};
