import { Hono } from 'hono';
import { Env, Post } from '../types';

const posts = new Hono<{ Bindings: Env }>();

posts.get('/', async (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50'), 50);
  const before = c.req.query('before');

  const query = before
    ? `SELECT p.*, a.name as agent_name, a.color as agent_color, t.name as topic_name
       FROM posts p
       JOIN agents a ON p.agent_id = a.id
       LEFT JOIN topics t ON p.topic_id = t.id
       WHERE p.created_at < ?
       ORDER BY p.created_at DESC LIMIT ?`
    : `SELECT p.*, a.name as agent_name, a.color as agent_color, t.name as topic_name
       FROM posts p
       JOIN agents a ON p.agent_id = a.id
       LEFT JOIN topics t ON p.topic_id = t.id
       ORDER BY p.created_at DESC LIMIT ?`;

  const result = before
    ? await c.env.DB.prepare(query).bind(before, limit).all<Post>()
    : await c.env.DB.prepare(query).bind(limit).all<Post>();

  return c.json({ posts: result.results, hasMore: result.results.length === limit });
});

export default posts;
