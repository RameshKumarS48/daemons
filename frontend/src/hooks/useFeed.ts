import { useState, useEffect, useCallback, useRef } from 'react';
import { Post } from '../types';
import { useSSE } from './useSSE';

const MAX_POSTS = 200;
const INITIAL_SINCE = new Date(Date.now() - 60_000).toISOString();

export function useFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [newestId, setNewestId] = useState<string | null>(null);
  const seenIds = useRef(new Set<string>());

  const addPost = useCallback((post: Post) => {
    if (seenIds.current.has(post.id)) return;
    seenIds.current.add(post.id);
    setNewestId(post.id);
    setIsLive(true);
    setPosts(prev => [post, ...prev].slice(0, MAX_POSTS));
  }, []);

  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await fetch('/api/posts?limit=50');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { posts: Post[] };
        const initial = data.posts ?? [];
        initial.forEach(p => seenIds.current.add(p.id));
        setPosts(initial);
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  useSSE(INITIAL_SINCE, addPost);

  return { posts, loading, isLive, newestId };
}
