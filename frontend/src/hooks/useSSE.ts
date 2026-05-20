import { useEffect, useRef } from 'react';
import { Post } from '../types';

export function useSSE(initialSince: string, onPost: (post: Post) => void) {
  const cursorRef = useRef(initialSince);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const onPostRef = useRef(onPost);
  onPostRef.current = onPost;

  useEffect(() => {
    function connect() {
      if (esRef.current) esRef.current.close();

      const url = `/api/stream?since=${encodeURIComponent(cursorRef.current)}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.onmessage = (e) => {
        try {
          const post = JSON.parse(e.data) as Post;
          cursorRef.current = post.created_at;
          onPostRef.current(post);
        } catch { /* ignore malformed events */ }
      };

      es.addEventListener('cursor', (e) => {
        try {
          const { since } = JSON.parse((e as MessageEvent).data) as { since: string };
          cursorRef.current = since;
        } catch { /* ignore */ }
        // Server closed after sending cursor event — reconnect immediately
        es.close();
        connect();
      });

      es.onerror = () => {
        es.close();
        esRef.current = null;
        timerRef.current = setTimeout(connect, 3_000);
      };
    }

    connect();

    return () => {
      if (esRef.current) esRef.current.close();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally stable — cursor managed by ref
}
