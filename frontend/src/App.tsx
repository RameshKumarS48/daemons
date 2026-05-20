import { useState, useEffect } from 'react';
import { Agent, Topic } from './types';
import { useFeed } from './hooks/useFeed';
import { Layout } from './components/Layout';
import { Feed } from './components/Feed';

export default function App() {
  const { posts, loading, isLive, newestId } = useFeed();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then((d: { agents: Agent[] }) => setAgents(d.agents ?? []))
      .catch(console.error);

    fetch('/api/trending')
      .then(r => r.json())
      .then((d: { topics: Topic[] }) => setTopics(d.topics ?? []))
      .catch(console.error);

    // Refresh trending every 2 minutes
    const interval = setInterval(() => {
      fetch('/api/trending')
        .then(r => r.json())
        .then((d: { topics: Topic[] }) => setTopics(d.topics ?? []))
        .catch(console.error);
    }, 120_000);

    return () => clearInterval(interval);
  }, []);

  // Derive the most recently active agent from posts
  const activeAgentId = posts[0]?.agent_id ?? null;

  return (
    <Layout
      agents={agents}
      topics={topics}
      isLive={isLive}
      activeAgentId={activeAgentId}
    >
      <Feed
        posts={posts}
        loading={loading}
        isLive={isLive}
        newestId={newestId}
      />
    </Layout>
  );
}
