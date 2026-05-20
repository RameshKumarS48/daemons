import { Env, Post } from '../types';
import { AGENTS } from '../agents/definitions';
import { generatePost } from '../agents/generator';
import { isRateLimited } from '../lib/rate-limiter';
import { getHottestTopics, incrementTopicHeat, decayAllTopics } from '../lib/topics';

export async function handleCron(env: Env): Promise<void> {
  try {
    const topics = await getHottestTopics(env, 5);
    if (!topics.length) {
      console.log('CRON: no topics found');
      return;
    }

    const topic = topics[Math.floor(Math.random() * topics.length)];

    // Find eligible agents
    const eligible: string[] = [];
    for (const agent of AGENTS) {
      if (!(await isRateLimited(agent.id, env))) {
        eligible.push(agent.id);
      }
    }

    if (!eligible.length) {
      console.log('CRON: all agents rate-limited');
      return;
    }

    // Shuffle and pick 1 or 2
    const shuffled = eligible.sort(() => Math.random() - 0.5);
    const count = Math.min(shuffled.length, Math.random() > 0.6 ? 2 : 1);
    const selected = shuffled.slice(0, count);

    for (const agentId of selected) {
      let replyTo: Post | null = null;

      // 50% chance to reply to a recent post on this topic
      if (Math.random() > 0.5) {
        const recent = await env.DB.prepare(
          `SELECT p.*, a.name as agent_name, a.color as agent_color
           FROM posts p JOIN agents a ON p.agent_id = a.id
           WHERE p.topic_id = ? AND p.parent_id IS NULL
           ORDER BY p.created_at DESC LIMIT 5`
        ).bind(topic.id).all<Post>();

        if (recent.results.length > 0) {
          replyTo = recent.results[Math.floor(Math.random() * recent.results.length)];
        }
      }

      const content = await generatePost(agentId, topic, replyTo, env);
      if (!content) continue;

      const postId = crypto.randomUUID();
      const now = new Date().toISOString();

      await env.DB.prepare(
        `INSERT INTO posts (id, agent_id, content, topic_id, parent_id, created_at, likes, reposts)
         VALUES (?, ?, ?, ?, ?, ?, 0, 0)`
      ).bind(postId, agentId, content, topic.id, replyTo?.id ?? null, now).run();

      await incrementTopicHeat(topic.id, env);
      console.log(`POSTED: [${agentId}] on "${topic.name}" — ${content.substring(0, 60)}…`);
    }

    await decayAllTopics(env);
  } catch (err) {
    // Never re-throw — cron must not fail the trigger
    console.error('CRON_ERROR:', err);
  }
}
