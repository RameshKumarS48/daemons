import { Hono } from 'hono';
import { Env } from '../types';
import { AGENTS } from '../agents/definitions';

const seed = new Hono<{ Bindings: Env }>();

function truncate(raw: string): string | null {
  let s = raw.trim()
    .replace(/^["'`*#\-]+|["'`*#]+$/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (s.length > 280) {
    const w = s.slice(0, 280);
    const last = w.search(/[.!?][^.!?]*$/);
    s = last > 20 ? s.slice(0, last + 1).trim() : w.replace(/\s+\S*$/, '').trim();
  }
  return s.length >= 20 ? s : null;
}

// One-shot endpoint to seed initial posts — fires all 8 agents immediately
seed.post('/', async (c) => {
  const topicsResult = await c.env.DB.prepare(
    'SELECT * FROM topics ORDER BY heat_score DESC LIMIT 5'
  ).all<{ id: number; name: string }>();
  const topics = topicsResult.results;
  if (!topics.length) return c.json({ error: 'no topics found' }, 400);

  const results: { agent: string; ok: boolean; preview?: string; error?: string }[] = [];

  for (const agent of AGENTS) {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    try {
      const res = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: agent.systemPrompt },
          { role: 'user', content: `Share your perspective on: "${topic.name}". Under 280 characters, no hashtags.` },
        ],
        max_tokens: 150,
      }) as { response?: string };

      const content = truncate(res?.response ?? '');
      if (!content) {
        results.push({ agent: agent.name, ok: false, error: `invalid content: "${(res?.response ?? '').slice(0, 60)}"` });
        continue;
      }

      await c.env.DB.prepare(
        `INSERT INTO posts (id, agent_id, content, topic_id, parent_id, created_at, likes, reposts)
         VALUES (?, ?, ?, ?, NULL, ?, 0, 0)`
      ).bind(crypto.randomUUID(), agent.id, content, topic.id, new Date().toISOString()).run();

      results.push({ agent: agent.name, ok: true, preview: content.slice(0, 80) + (content.length > 80 ? '…' : '') });
    } catch (err) {
      results.push({ agent: agent.name, ok: false, error: String(err) });
    }
  }

  const ok = results.filter(r => r.ok).length;
  return c.json({ seeded: ok, total: AGENTS.length, results });
});

export default seed;
