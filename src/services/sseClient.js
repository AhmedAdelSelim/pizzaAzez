/**
 * SSE client for React Native using XMLHttpRequest's onprogress streaming.
 * (React Native does not have a native EventSource API.)
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.29:3000/api';

class SSEClient {
    constructor() {
        this.listeners = {};   // event name -> handler[]
        this.token = null;
        this.xhr = null;
        this.reconnectTimer = null;
        this.connected = false;
        this._lastIndex = 0;
        this._buffer = '';
    }

    /** Connect (or reconnect) using the provided JWT token. */
    connect(token) {
        this.token = token;
        this._clearReconnect();
        this._openConnection();
    }

    /** Disconnect and stop any pending reconnect. */
    disconnect() {
        this._clearReconnect();
        if (this.xhr) {
            this.xhr.abort();
            this.xhr = null;
        }
        this.connected = false;
        this._lastIndex = 0;
        this._buffer = '';
    }

    /**
     * Subscribe to an SSE event.
     * Returns an unsubscribe function.
     */
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

    _openConnection() {
        if (!this.token) return;

        this._lastIndex = 0;
        this._buffer = '';

        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${BASE_URL}/events`, true);
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
        xhr.setRequestHeader('Accept', 'text/event-stream');
        xhr.setRequestHeader('Cache-Control', 'no-cache');

        xhr.onprogress = () => {
            const newText = xhr.responseText.slice(this._lastIndex);
            this._lastIndex = xhr.responseText.length;
            this._buffer += newText;

            // SSE messages are separated by double newlines
            const parts = this._buffer.split('\n\n');
            this._buffer = parts.pop(); // Keep incomplete last part

            for (const part of parts) {
                if (!part.trim() || part.startsWith(':')) continue; // heartbeat / comment
                let event = 'message';
                let data = null;

                for (const line of part.split('\n')) {
                    if (line.startsWith('event:')) {
                        event = line.slice(6).trim();
                    } else if (line.startsWith('data:')) {
                        try {
                            data = JSON.parse(line.slice(5).trim());
                        } catch {
                            data = line.slice(5).trim();
                        }
                    }
                }

                if (data !== null) {
                    if (event === 'connected') this.connected = true;
                    this._emit(event, data);
                }
            }
        };

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                this.connected = false;
                this.xhr = null;
                // Reconnect after 5 s unless explicitly disconnected
                if (this.token) {
                    this._scheduleReconnect();
                }
            }
        };

        xhr.onerror = () => {
            this.connected = false;
            this.xhr = null;
            if (this.token) this._scheduleReconnect();
        };

        xhr.send();
        this.xhr = xhr;
    }

    _scheduleReconnect() {
        this._clearReconnect();
        this.reconnectTimer = setTimeout(() => {
            this._openConnection();
        }, 5000);
    }

    _clearReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
}

export default new SSEClient();
