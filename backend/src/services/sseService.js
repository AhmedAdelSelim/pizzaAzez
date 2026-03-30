const { PassThrough } = require('stream');
const cluster = require('cluster');

class SSEService {
    constructor() {
        // Map of userId -> Set<PassThrough stream>  (local to this worker)
        this.clients = new Map();
        // Set of streams for admin clients (local to this worker)
        this.adminClients = new Set();

        // In cluster mode, receive fan-out messages from the master process
        // and deliver them to whichever SSE clients live in this worker.
        if (cluster.isWorker) {
            process.on('message', (msg) => {
                if (msg?.type === 'sse') {
                    this._deliverLocally(msg.target, msg.targetId, msg.event, msg.data);
                }
            });
        }
    }

    // ── stream management ────────────────────────────────────────────────────

    createStream(userId, isAdmin) {
        const stream = new PassThrough();

        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }
        this.clients.get(userId).add(stream);
        if (isAdmin) this.adminClients.add(stream);

        const cleanup = () => {
            const userStreams = this.clients.get(userId);
            if (userStreams) {
                userStreams.delete(stream);
                if (userStreams.size === 0) this.clients.delete(userId);
            }
            this.adminClients.delete(stream);
        };

        return { stream, cleanup };
    }

    // ── public send API ──────────────────────────────────────────────────────

    sendToUser(userId, event, data) {
        this._publish('user', userId, event, data);
    }

    sendToAdmins(event, data) {
        this._publish('admins', null, event, data);
    }

    sendToAll(event, data) {
        this._publish('all', null, event, data);
    }

    // ── internal ─────────────────────────────────────────────────────────────

    /**
     * In cluster mode: send an IPC message to the master process, which will
     * fan it out to every worker (including this one).  Each worker then
     * calls _deliverLocally, which only touches its own in-memory streams.
     *
     * In single-process mode: deliver directly.
     */
    _publish(target, targetId, event, data) {
        if (cluster.isWorker) {
            process.send({ type: 'sse', target, targetId, event, data });
        } else {
            this._deliverLocally(target, targetId, event, data);
        }
    }

    _deliverLocally(target, targetId, event, data) {
        if (target === 'user') {
            const userStreams = this.clients.get(targetId);
            if (!userStreams) return;
            for (const stream of userStreams) this._write(stream, event, data);
        } else if (target === 'admins') {
            for (const stream of this.adminClients) this._write(stream, event, data);
        } else if (target === 'all') {
            for (const streams of this.clients.values()) {
                for (const stream of streams) this._write(stream, event, data);
            }
        }
    }

    _write(stream, event, data) {
        try {
            stream.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        } catch {
            // Client already disconnected
        }
    }
}

module.exports = new SSEService();
