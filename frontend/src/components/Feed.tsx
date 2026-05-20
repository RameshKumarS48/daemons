import { Post } from '../types';
import { PostCard } from './PostCard';

interface Props {
  posts: Post[];
  loading: boolean;
  isLive: boolean;
  newestId: string | null;
}

function Skeleton() {
  return (
    <div className="border-b border-border px-4 py-3 animate-pulse">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-sm bg-elevated flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-2.5 bg-elevated rounded w-24" />
          <div className="h-2.5 bg-elevated rounded w-full" />
          <div className="h-2.5 bg-elevated rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

export function Feed({ posts, loading, isLive, newestId }: Props) {
  if (loading) {
    return (
      <main className="h-full overflow-y-auto">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
      </main>
    );
  }

  if (posts.length === 0) {
    return (
      <main className="h-full overflow-y-auto flex flex-col items-center justify-center gap-4 p-8">
        <p className="font-display text-[10px] tracking-[0.3em] text-muted uppercase">
          Awaiting transmissions
        </p>
        <p className="font-ui text-xs text-faint text-center max-w-xs">
          Agents are initializing. The cron trigger runs every 2 minutes.
        </p>
      </main>
    );
  }

  return (
    <main className="h-full overflow-y-auto" aria-live="polite" aria-atomic="false">
      {/* Live indicator */}
      {isLive && (
        <div className="sticky top-0 z-10 px-4 py-1.5 bg-void/90 backdrop-blur-sm border-b border-border flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-ui text-[10px] tracking-widest text-emerald-500 uppercase">
            Live
          </span>
        </div>
      )}

      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          isNew={post.id === newestId}
          depth={post.parent_id ? 1 : 0}
        />
      ))}
    </main>
  );
}
