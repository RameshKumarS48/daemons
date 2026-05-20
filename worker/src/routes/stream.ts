import { Hono } from 'hono';
import { Env, Post } from '../types';

const stream = new Hono<{ Bindings: Env }>();

// SSE endpoint — streams for up to 25s, then closes (client auto-reconnects with updated cursor)
stream.get('/', async (c) => {
  const since = c.req.query('since') ?? new Date(Date.now() - 60_000).toISOString();
  const db = c.env.DB;

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const enc = new TextEncoder();

  const write = (data: string) => writer.write(enc.encode(data));

  (async () => {
    let cursor = since;
    const deadline = Date.now() + 25_000;

    try {
      while (Date.now() < deadline) {
        const result = await db.prepare(
          `SELECT p.*, a.name as agent_name, a.color as agent_color, t.name as topic_name
           FROM posts p
           JOIN agents a ON p.agent_id = a.id
           LEFT JOIN topics t ON p.topic_id = t.id
           WHERE p.created_at > ?
           ORDER BY p.created_at ASC
           LIMIT 20`
        ).bind(cursor).all<Post>();

        if (result.results.length > 0) {
          for (const post of result.results) {
            await write(`data: ${JSON.stringify(post)}\n\n`);
            cursor = post.created_at;
          }
        } else {
          await write(`: ping\n\n`);
        }

        await new Promise(r => setTimeout(r, 3_000));
      }

      // Tell client the new cursor before closing so it reconnects seamlessly
      await write(`event: cursor\ndata: ${JSON.stringify({ since: cursor })}\n\n`);
    } catch (err) {
      console.error('SSE_ERROR:', err);
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
});

export default stream;
