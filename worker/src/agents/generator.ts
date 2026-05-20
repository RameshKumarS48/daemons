import { Env, Post } from '../types';
import { AGENTS } from './definitions';
import { isCircuitOpen, recordFailure, recordSuccess } from '../lib/circuit-breaker';
import { isRateLimited, consumeRateLimit } from '../lib/rate-limiter';

// Free Cloudflare Workers AI — no API key needed
const MODEL = '@cf/meta/llama-3.1-8b-instruct';

const MIN_LENGTH = 20;
const MAX_LENGTH = 280;

function validateContent(raw: string): string | null {
  let cleaned = raw
    .trim()
    .replace(/^["'`*#]+|["'`*#]+$/g, '')   // strip quotes/markdown artifacts
    .replace(/\n+/g, ' ')                   // collapse newlines
    .replace(/\s{2,}/g, ' ')               // collapse multiple spaces
    .trim();

  if (cleaned.length < MIN_LENGTH) return null;

  // Truncate to last complete sentence within MAX_LENGTH
  if (cleaned.length > MAX_LENGTH) {
    const window = cleaned.slice(0, MAX_LENGTH);
    const lastSentence = window.search(/[.!?][^.!?]*$/);
    if (lastSentence > MIN_LENGTH) {
      cleaned = cleaned.slice(0, lastSentence + 1).trim();
    } else {
      // No sentence boundary — hard truncate at word boundary
      cleaned = window.replace(/\s+\S*$/, '').trim();
    }
  }

  if (cleaned.length < MIN_LENGTH || cleaned.length > MAX_LENGTH) return null;
  return cleaned;
}

export async function generatePost(
  agentId: string,
  topic: { id: number; name: string },
  replyTo: Post | null,
  env: Env,
): Promise<string | null> {
  if (await isCircuitOpen(env)) {
    console.log('CIRCUIT_OPEN: skipping generation');
    return null;
  }

  if (await isRateLimited(agentId, env)) {
    console.log(`RATE_LIMITED: ${agentId}`);
    return null;
  }

  const agent = AGENTS.find(a => a.id === agentId);
  if (!agent) return null;

  const userPrompt = replyTo
    ? `${replyTo.agent_name} said: "${replyTo.content}"\n\nRespond to this regarding "${topic.name}". Under 280 characters, no hashtags.`
    : `Share your perspective on: "${topic.name}". Under 280 characters, no hashtags.`;

  const delays = [1000, 2000, 4000];

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await env.AI.run(MODEL, {
        messages: [
          { role: 'system', content: agent.systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 150,
      }) as { response?: string };

      const content = validateContent(result?.response ?? '');

      if (!content) {
        console.log(`CONTENT_INVALID: ${agentId} — "${(result?.response ?? '').substring(0, 60)}"`);
        // Don't retry invalid content — count as a non-error skip
        return null;
      }

      await consumeRateLimit(agentId, env);
      await recordSuccess(env);
      return content;
    } catch (err) {
      console.error(`GENERATION_ERROR attempt ${attempt + 1}:`, err);
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, delays[attempt]));
      }
    }
  }

  await recordFailure(env);
  return null;
}
