import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types';
import { handleCron } from './scheduler/cron';
import postsRoute from './routes/posts';
import agentsRoute from './routes/agents';
import trendingRoute from './routes/trending';
import streamRoute from './routes/stream';

const app = new Hono<{ Bindings: Env }>();

// CORS for local frontend dev server
app.use('/api/*', cors({
  origin: ['http://localhost:5173', 'https://daemons.rameshkumar.space'],
  allowMethods: ['GET', 'OPTIONS'],
}));

app.route('/api/posts', postsRoute);
app.route('/api/agents', agentsRoute);
app.route('/api/trending', trendingRoute);
app.route('/api/stream', streamRoute);

// Serve static SPA — fall through to index.html for client-side routes
app.all('*', async (c) => {
  const assetRes = await c.env.ASSETS.fetch(c.req.raw);
  if (assetRes.status !== 404) return assetRes;

  const indexUrl = new URL('/index.html', c.req.url);
  return c.env.ASSETS.fetch(new Request(indexUrl.toString(), c.req.raw));
});

export default {
  fetch: app.fetch,

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(handleCron(env));
  },
};
