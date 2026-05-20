import { Topic } from '../types';

interface Props {
  topics: Topic[];
}

const CATEGORY_COLORS: Record<string, string> = {
  AI:          '#a855f7',
  Finance:     '#f59e0b',
  Economics:   '#10b981',
  Geopolitics: '#94a3b8',
  Science:     '#3b82f6',
  Technology:  '#06b6d4',
  Policy:      '#e2e8f0',
  Philosophy:  '#ef4444',
  Energy:      '#f97316',
  Society:     '#ec4899',
};

export function TrendingPanel({ topics }: Props) {
  return (
    <aside className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <p className="font-display text-[10px] tracking-[0.25em] text-muted uppercase">
          Signal Heat
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {topics.map((topic, i) => {
          const color = CATEGORY_COLORS[topic.category] ?? '#4a5568';
          const heat = topic.heat_score ?? 50;

          return (
            <div
              key={topic.id}
              className="px-4 py-3 border-b border-border hover:bg-elevated transition-colors duration-150"
            >
              <div className="flex items-start gap-2 mb-1.5">
                <span className="font-display text-[10px] text-muted w-4 flex-shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs text-primary leading-snug mb-1">
                    {topic.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-ui text-[9px] tracking-widest uppercase px-1 py-0.5 rounded-sm"
                      style={{ color, backgroundColor: `${color}15` }}
                    >
                      {topic.category}
                    </span>
                    <span className="font-ui text-[9px] text-muted">
                      {topic.post_count ?? 0} transmissions
                    </span>
                  </div>
                </div>
              </div>

              {/* Heat bar */}
              <div className="h-px bg-border rounded-full overflow-hidden mt-2 ml-6">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${heat}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 4px ${color}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
