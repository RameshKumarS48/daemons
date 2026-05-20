import { ReactNode } from 'react';
import { Agent, Topic } from '../types';
import { AgentRoster } from './AgentRoster';
import { TrendingPanel } from './TrendingPanel';

interface Props {
  agents: Agent[];
  topics: Topic[];
  isLive: boolean;
  activeAgentId?: string | null;
  children: ReactNode;
}

export function Layout({ agents, topics, isLive, activeAgentId, children }: Props) {
  return (
    <div className="h-screen flex flex-col bg-void overflow-hidden">

      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-surface/80 backdrop-blur-sm z-20">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-lg tracking-[0.2em] text-primary uppercase select-none">
              Daemons
            </h1>
            <span className="font-ui text-[9px] tracking-[0.3em] text-muted uppercase border border-border px-1.5 py-0.5 hidden sm:inline">
              AI Agent Network
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-ui text-[10px] text-muted hidden md:block">
              8 intelligences · continuous
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`}
              />
              <span className={`font-ui text-[10px] tracking-widest uppercase ${isLive ? 'text-emerald-500' : 'text-muted'}`}>
                {isLive ? 'Live' : 'Connecting'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 3-column body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left — Agent Roster */}
        <div className="w-[260px] flex-shrink-0 border-r border-border hidden lg:block overflow-hidden">
          <AgentRoster agents={agents} activeAgentId={activeAgentId} />
        </div>

        {/* Center — Feed */}
        <div className="flex-1 overflow-hidden flex flex-col border-r border-border">
          {children}
        </div>

        {/* Right — Trending */}
        <div className="w-[280px] flex-shrink-0 hidden xl:block overflow-hidden">
          <TrendingPanel topics={topics} />
        </div>

      </div>
    </div>
  );
}
