/**
 * Minimal PartyKit client using React Native's built-in WebSocket.
 * No browser-polyfills needed.
 *
 * Rooms:
 *   all        – broadcast (new_story, story_deleted)
 *   admins     – admin events (new_order, order_updated)
 *   user-{id}  – per-user events (order_status)
 */

const PARTYKIT_HOST = (process.env.EXPO_PUBLIC_PARTYKIT_WS_URL || '')
    .replace(/^wss?:\/\//, '');

class PartyKitClient {
    constructor() {
        this.sockets = {};          // roomId -> WebSocket
        this.listeners = {};        // event -> handler[]
        this.reconnectTimers = {};
        this.userId = null;
        this.isAdmin = false;
        this.active = false;
        this.stories = [];          // cached story list from PartyKit
    }

    connect(userId, isAdmin) {
        this.userId = userId;
        this.isAdmin = isAdmin;
        this.active = true;

        const rooms = ['all', `user-${userId}`];
        if (isAdmin) rooms.push('admins');
        rooms.forEach(r => this._open(r));
    }

    disconnect() {
        this.active = false;
        this.userId = null;
        this.isAdmin = false;
        Object.keys(this.reconnectTimers).forEach(r => {
            clearTimeout(this.reconnectTimers[r]);
            delete this.reconnectTimers[r];
        });
        Object.values(this.sockets).forEach(ws => {
            try { ws.close(); } catch {}
        });
        this.sockets = {};
    }

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

    _open(roomId) {
        if (!PARTYKIT_HOST || !this.active) return;
        if (this.sockets[roomId]) {
            try { this.sockets[roomId].close(); } catch {}
        }

        const protocol = PARTYKIT_HOST.startsWith('localhost') ||
            PARTYKIT_HOST.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./)
            ? 'ws' : 'wss';

        const ws = new WebSocket(
            `${protocol}://${PARTYKIT_HOST}/parties/main/${roomId}`
        );

        ws.onopen = () => {
            console.log(`[PartyKit] connected: ${roomId}`);
        };

        ws.onmessage = (e) => {
            try {
                const { event, data } = JSON.parse(e.data);
                if (event === 'stories_init') this.stories = data;
                else if (event === 'new_story') this.stories = [...this.stories, data];
                else if (event === 'story_deleted') this.stories = this.stories.filter(s => s.id !== data.id);
                if (event && event !== 'connected') this._emit(event, data);
            } catch {}
        };

        ws.onclose = () => {
            delete this.sockets[roomId];
            if (this.active) {
                this.reconnectTimers[roomId] = setTimeout(() => {
                    delete this.reconnectTimers[roomId];
                    this._open(roomId);
                }, 3000);
            }
        };

        ws.onerror = (e) => {
            console.warn(`[PartyKit] error on ${roomId}:`, e.message);
        };

        this.sockets[roomId] = ws;
    }
}

export default new PartyKitClient();
