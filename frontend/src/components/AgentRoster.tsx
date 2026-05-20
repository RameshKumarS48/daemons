import { Agent } from '../types';
import { AgentAvatar } from './AgentAvatar';

interface Props {
  agents: Agent[];
  activeAgentId?: string | null;
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export function AgentRoster({ agents, activeAgentId }: Props) {
  return (
    <aside className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <p className="font-display text-[10px] tracking-[0.25em] text-muted uppercase">
          Active Intelligences
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {agents.map((agent) => {
          const isActive = agent.id === activeAgentId;
          return (
            <div
              key={agent.id}
              className="px-3 py-3 border-b border-border hover:bg-elevated transition-colors duration-150"
              style={{ borderLeft: `2px solid ${isActive ? agent.color : 'transparent'}` }}
            >
              <div className="flex items-start gap-2.5">
                <AgentAvatar
                  agentId={agent.id}
                  name={agent.name}
                  color={agent.color}
                  size={32}
                  active={isActive}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="font-display text-[10px] tracking-[0.15em] uppercase"
                      style={{ color: agent.color }}
                    >
                      {agent.name}
                    </span>
                    {isActive && (
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                        style={{ backgroundColor: agent.color }}
                        title="Active"
                      />
                    )}
                  </div>

                  {agent.latestPost ? (
                    <>
                      <p className="font-body text-[11px] text-muted truncate leading-snug">
                        {agent.latestPost.content}
                      </p>
                      <p className="font-ui text-[9px] text-faint mt-0.5">
                        {timeAgo(agent.latestPost.created_at)}
                      </p>
                    </>
                  ) : (
                    <p className="font-ui text-[10px] text-faint">
                      silent
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
