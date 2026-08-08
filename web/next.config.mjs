import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // The RN app one level up has its own lockfile; pin the root to this app.
    turbopack: {
        root: path.dirname(new URL(import.meta.url).pathname),
    },
};

export default nextConfig;
