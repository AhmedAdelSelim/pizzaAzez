const { PassThrough } = require('stream');

class SSEService {
    constructor() {
        // Map of userId -> Set<PassThrough stream>
        this.clients = new Map();
        // Set of streams for admin clients
        this.adminClients = new Set();
    }

    /**
     * Create an SSE stream for a connected client.
     * Returns { stream, cleanup } — caller must call cleanup() when client disconnects.
     */
    createStream(userId, isAdmin) {
        const stream = new PassThrough();

        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }
        this.clients.get(userId).add(stream);

        if (isAdmin) {
            this.adminClients.add(stream);
        }

        const cleanup = () => {
            const userStreams = this.clients.get(userId);
            if (userStreams) {
                userStreams.delete(stream);
                if (userStreams.size === 0) {
                    this.clients.delete(userId);
                }
            }
            this.adminClients.delete(stream);
        };

        return { stream, cleanup };
    }

    _write(stream, event, data) {
        try {
            stream.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        } catch {
            // Client already disconnected
        }
    }

    /** Send an event to a specific user (all their open connections). */
    sendToUser(userId, event, data) {
        const userStreams = this.clients.get(userId);
        if (!userStreams) return;
        for (const stream of userStreams) {
            this._write(stream, event, data);
        }
    }

    /** Send an event to all connected admins. */
    sendToAdmins(event, data) {
        for (const stream of this.adminClients) {
            this._write(stream, event, data);
        }
    }

    /** Send an event to every connected client. */
    sendToAll(event, data) {
        for (const streams of this.clients.values()) {
            for (const stream of streams) {
                this._write(stream, event, data);
            }
        }
    }
}

module.exports = new SSEService();
