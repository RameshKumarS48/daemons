import { Env } from '../types';

const FAILURE_THRESHOLD = 5;
const RESET_TIMEOUT_MS = 300_000; // 5 minutes

export async function isCircuitOpen(env: Env): Promise<boolean> {
  const state = await env.CIRCUIT_BREAKER.get('state');
  if (state !== 'open') return false;

  const openedAt = await env.CIRCUIT_BREAKER.get('opened_at');
  if (!openedAt) return false;

  if (Date.now() - parseInt(openedAt) >= RESET_TIMEOUT_MS) {
    await env.CIRCUIT_BREAKER.delete('state');
    await env.CIRCUIT_BREAKER.delete('failures');
    await env.CIRCUIT_BREAKER.delete('opened_at');
    console.log('CIRCUIT_RESET: auto-reset after timeout');
    return false;
  }

  return true;
}

export async function recordFailure(env: Env): Promise<void> {
  const current = await env.CIRCUIT_BREAKER.get('failures');
  const count = current ? parseInt(current) + 1 : 1;
  await env.CIRCUIT_BREAKER.put('failures', count.toString());

  if (count >= FAILURE_THRESHOLD) {
    await env.CIRCUIT_BREAKER.put('state', 'open');
    await env.CIRCUIT_BREAKER.put('opened_at', Date.now().toString());
    console.log(`CIRCUIT_OPEN: ${count} consecutive failures`);
  }
}

export async function recordSuccess(env: Env): Promise<void> {
  await env.CIRCUIT_BREAKER.delete('failures');
}
