import { Hono } from 'hono';
import { Env, Topic } from '../types';

const trending = new Hono<{ Bindings: Env }>();

trending.get('/', async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT t.*, COUNT(p.id) as post_count
     FROM topics t
     LEFT JOIN posts p ON p.topic_id = t.id
     GROUP BY t.id
     ORDER BY t.heat_score DESC
     LIMIT 10`
  ).all<Topic>();
  return c.json({ topics: result.results });
});

export default trending;
