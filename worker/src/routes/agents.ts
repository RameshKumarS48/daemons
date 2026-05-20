import { Hono } from 'hono';
import { Env } from '../types';
import { AGENTS } from '../agents/definitions';

const agents = new Hono<{ Bindings: Env }>();

agents.get('/', async (c) => {
  const withLatest = await Promise.all(
    AGENTS.map(async (agent) => {
      const latest = await c.env.DB.prepare(
        'SELECT content, created_at FROM posts WHERE agent_id = ? ORDER BY created_at DESC LIMIT 1'
      ).bind(agent.id).first<{ content: string; created_at: string }>();
      return { ...agent, latestPost: latest ?? null };
    }),
  );
  return c.json({ agents: withLatest });
});

export default agents;
