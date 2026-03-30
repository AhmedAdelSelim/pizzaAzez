const { getDb } = require('../config/db');

const STORY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // run every hour

async function deleteExpiredStories() {
    try {
        const db = getDb();
        const cutoff = new Date(Date.now() - STORY_TTL_MS).toISOString();

        // Delete stories older than 24 h
        const { error: expiredError } = await db
            .from('stories')
            .delete()
            .lt('created_at', cutoff);

        if (expiredError) {
            console.error('[cleanup] Failed to delete expired stories:', expiredError.message);
            return;
        }

        // Also remove legacy rows that have no created_at (can't determine age)
        const { error: nullError } = await db
            .from('stories')
            .delete()
            .is('created_at', null);

        if (nullError) {
            console.error('[cleanup] Failed to delete stories with null created_at:', nullError.message);
        } else {
            console.log('[cleanup] Expired stories removed at', new Date().toISOString());
        }
    } catch (err) {
        console.error('[cleanup] Unexpected error:', err.message);
    }
}

function startCleanupJob() {
    // Run once immediately on startup, then every hour
    deleteExpiredStories();
    setInterval(deleteExpiredStories, CLEANUP_INTERVAL_MS);
    console.log('[cleanup] Story cleanup job started (runs every hour)');
}

module.exports = { startCleanupJob };
