import type * as Party from "partykit/server";

interface Story {
    id: string;
    title?: string | null;
    image?: string | null;
    owner?: string | null;
    owner_image?: string | null;
    bg_colors?: string[] | null;
    active: boolean;
    created_at: string;
}

const STORY_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Rooms:
 *   all        – stores stories in memory, broadcasts story events + stories_init on connect
 *   admins     – broadcasts admin events (new_order, order_updated)
 *   user-{id}  – broadcasts per-user events (order_status)
 *
 * Backend POSTs:
 *   { action: 'add_story', story }   → store + broadcast new_story
 *   { action: 'delete_story', id }   → remove + broadcast story_deleted
 *   { event, data }                  → generic broadcast (orders etc.)
 */
export default class Server implements Party.Server {
    stories: Story[] = [];

    constructor(readonly room: Party.Room) {
        if (room.id === "all") {
            setInterval(() => this._cleanup(), 60 * 60 * 1000);
        }
    }

    _cleanup() {
        const cutoff = Date.now() - STORY_TTL_MS;
        const before = this.stories.length;
        this.stories = this.stories.filter(
            (s) => new Date(s.created_at).getTime() > cutoff
        );
        if (this.stories.length !== before) {
            this.room.broadcast(
                JSON.stringify({ event: "stories_init", data: this.stories })
            );
        }
    }

    async onRequest(req: Party.Request): Promise<Response> {
        if (req.method !== "POST") {
            return new Response("Method not allowed", { status: 405 });
        }

        const secret = this.room.env.BACKEND_SECRET as string | undefined;
        if (secret) {
            const auth = req.headers.get("Authorization");
            if (auth !== `Bearer ${secret}`) {
                return new Response("Unauthorized", { status: 401 });
            }
        }

        const body = (await req.json()) as any;

        if (this.room.id === "all" && body.action === "add_story") {
            this._cleanup();
            this.stories.push(body.story);
            this.room.broadcast(
                JSON.stringify({ event: "new_story", data: body.story })
            );
        } else if (this.room.id === "all" && body.action === "delete_story") {
            this.stories = this.stories.filter((s) => s.id !== body.id);
            this.room.broadcast(
                JSON.stringify({ event: "story_deleted", data: { id: body.id } })
            );
        } else {
            this.room.broadcast(JSON.stringify(body));
        }

        return new Response("ok", { status: 200 });
    }

    onConnect(conn: Party.Connection) {
        if (this.room.id === "all") {
            this._cleanup();
            conn.send(
                JSON.stringify({ event: "stories_init", data: this.stories })
            );
        }
    }
}
