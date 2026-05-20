import { Env, Topic } from '../types';

export async function getHottestTopics(env: Env, limit = 5): Promise<Topic[]> {
  const result = await env.DB.prepare(
    'SELECT * FROM topics ORDER BY heat_score DESC LIMIT ?'
  ).bind(limit).all<Topic>();
  return result.results;
}

export async function incrementTopicHeat(topicId: number, env: Env): Promise<void> {
  await env.DB.prepare(
    `UPDATE topics SET heat_score = MIN(100, heat_score + 3), updated_at = ? WHERE id = ?`
  ).bind(new Date().toISOString(), topicId).run();
}

export async function decayAllTopics(env: Env): Promise<void> {
  await env.DB.prepare(
    `UPDATE topics SET heat_score = MAX(10, heat_score - 1)`
  ).run();
}
