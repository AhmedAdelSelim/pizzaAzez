/**
 * SSE client for the backend's /events stream.
 *
 * Uses fetch + ReadableStream rather than EventSource because the endpoint
 * requires an Authorization header, which EventSource cannot send.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/** Set by AuthContext; invoked when the stream rejects our token. */
let onUnauthorized = null;
export function setSseUnauthorizedHandler(handler) {
    onUnauthorized = handler;
}

class SSEClient {
    constructor() {
        this.listeners = {};   // event name -> handler[]
        this.token = null;
        this.controller = null;
        this.reconnectTimer = null;
        this.connected = false;
    }

    /** Connect (or reconnect) using the provided JWT token. */
    connect(token) {
        this.token = token;
        this._clearReconnect();
        this._openConnection();
    }

    /** Disconnect and stop any pending reconnect. */
    disconnect() {
        this.token = null;
        this._clearReconnect();
        if (this.controller) {
            this.controller.abort();
            this.controller = null;
        }
        this.connected = false;
    }

    /** Subscribe to an SSE event. Returns an unsubscribe function. */
    on(event, handler) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(handler);
        return () => this.off(event, handler);
    }

    off(event, handler) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(h => h !== handler);
        }
    }

    _emit(event, data) {
        (this.listeners[event] || []).forEach(h => h(data));
    }

    async _openConnection() {
        if (!this.token || typeof window === 'undefined') return;

        const controller = new AbortController();
        this.controller = controller;

        try {
            const response = await fetch(`${BASE_URL}/events`, {
                headers: {
                    // Only CORS-safelisted headers plus Authorization. Sending
                    // Cache-Control here puts it in the preflight, and the
                    // server's allow-list does not include it — Safari then
                    // blocks the stream outright ("access control checks").
                    // The response already carries Cache-Control: no-cache.
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'text/event-stream',
                },
                signal: controller.signal,
            });

            // A rejected token will be rejected identically on every retry, so
            // reconnecting would poll the server forever and never recover.
            // Stop, and let the app force a fresh sign-in.
            if (response.status === 401 || response.status === 403) {
                this.disconnect();
                onUnauthorized?.();
                return;
            }

            if (!response.ok || !response.body) throw new Error('SSE connection failed');

            const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += value;

                // SSE messages are separated by double newlines
                const parts = buffer.split('\n\n');
                buffer = parts.pop(); // keep the incomplete trailing part

                for (const part of parts) {
                    if (!part.trim() || part.startsWith(':')) continue; // heartbeat / comment
                    let event = 'message';
                    let data = null;

                    for (const line of part.split('\n')) {
                        if (line.startsWith('event:')) {
                            event = line.slice(6).trim();
                        } else if (line.startsWith('data:')) {
                            const raw = line.slice(5).trim();
                            try {
                                data = JSON.parse(raw);
                            } catch {
                                data = raw;
                            }
                        }
                    }

                    if (data !== null) {
                        if (event === 'connected') this.connected = true;
                        this._emit(event, data);
                    }
                }
            }
        } catch {
            // fall through to reconnect
        }

        this.connected = false;
        this.controller = null;
        if (this.token && !controller.signal.aborted) this._scheduleReconnect();
    }

    _scheduleReconnect() {
        this._clearReconnect();
        this.reconnectTimer = setTimeout(() => this._openConnection(), 5000);
    }

    _clearReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
}

const sseClient = new SSEClient();
export default sseClient;
