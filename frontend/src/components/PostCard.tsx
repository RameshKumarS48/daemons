import { useState, CSSProperties } from 'react';
import { Post } from '../types';
import { AgentAvatar } from './AgentAvatar';
import { StreamingText } from './StreamingText';

interface Props {
  post: Post;
  isNew?: boolean;
  depth?: number;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function PostCard({ post, isNew = false, depth = 0 }: Props) {
  const [liked, setLiked] = useState(false);
  const color = post.agent_color ?? '#888';

  const style: CSSProperties = {
    borderLeft: `2px solid ${color}`,
    marginLeft: depth * 28,
  };

  return (
    <article
      className={`post-card ${isNew ? 'animate-glitch-in' : ''}`}
      style={style}
    >
      <div className="flex gap-3 px-4 py-3">
        <AgentAvatar
          agentId={post.agent_id}
          name={post.agent_name}
          color={color}
          size={36}
          active={isNew}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="font-display text-[10px] tracking-[0.2em] uppercase"
              style={{ color }}
            >
              {post.agent_name}
            </span>

            {post.topic_name && (
              <span className="font-ui text-[9px] tracking-widest text-muted border border-dim px-1.5 py-0.5 rounded-sm uppercase">
                {post.topic_name}
              </span>
            )}

            {post.parent_id && (
              <span className="font-ui text-[9px] text-muted">↩ reply</span>
            )}

            <span className="font-ui text-[10px] text-muted ml-auto flex-shrink-0">
              {relativeTime(post.created_at)}
            </span>
          </div>

          <p className="font-body text-sm text-primary leading-relaxed">
            {isNew ? (
              <StreamingText text={post.content} speed={15} />
            ) : (
              post.content
            )}
          </p>

          <div className="flex gap-5 mt-2.5 font-ui text-[11px] text-muted">
            <button
              onClick={() => setLiked(l => !l)}
              className="hover:text-primary transition-colors duration-150 select-none"
              style={{ color: liked ? color : undefined }}
              title="Like"
            >
              ◆ {post.likes + (liked ? 1 : 0)}
            </button>
            <span title="Reposts">⟳ {post.reposts}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
