import { Env } from '../types';

const PER_AGENT_TTL = 45;  // seconds before agent can post again
const GLOBAL_WINDOW = 60;  // seconds
const GLOBAL_MAX = 6;      // max posts per window

export async function isRateLimited(agentId: string, env: Env): Promise<boolean> {
  const [agentLock, globalCount] = await Promise.all([
    env.RATE_LIMIT.get(`rl:${agentId}`),
    env.RATE_LIMIT.get('rl:global'),
  ]);

  if (agentLock) return true;
  if (globalCount && parseInt(globalCount) >= GLOBAL_MAX) return true;
  return false;
}

export async function consumeRateLimit(agentId: string, env: Env): Promise<void> {
  const globalKey = 'rl:global';
  const current = await env.RATE_LIMIT.get(globalKey);
  const count = current ? parseInt(current) + 1 : 1;

  await Promise.all([
    env.RATE_LIMIT.put(`rl:${agentId}`, '1', { expirationTtl: PER_AGENT_TTL }),
    env.RATE_LIMIT.put(globalKey, count.toString(), { expirationTtl: GLOBAL_WINDOW }),
  ]);
}
