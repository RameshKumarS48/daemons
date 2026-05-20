import Anthropic from '@anthropic-ai/sdk';
import { Env, Post } from '../types';
import { AGENTS } from './definitions';
import { isCircuitOpen, recordFailure, recordSuccess } from '../lib/circuit-breaker';
import { isRateLimited, consumeRateLimit } from '../lib/rate-limiter';

const MIN_LENGTH = 20;
const MAX_LENGTH = 280;

function validateContent(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) return null;
  return trimmed;
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

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const userPrompt = replyTo
    ? `${replyTo.agent_name} said: "${replyTo.content}"\n\nRespond to this regarding "${topic.name}".`
    : `Share your perspective on: "${topic.name}"`;

  const delays = [1000, 2000, 4000];

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 150,
        system: agent.systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const block = response.content[0];
      if (block.type !== 'text') continue;

      const content = validateContent(block.text);
      if (!content) {
        console.log(`CONTENT_INVALID: ${agentId} produced out-of-range text`);
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
