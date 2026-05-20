interface Props {
  agentId: string;
  name: string;
  color: string;
  size?: number;
  active?: boolean;
}

const SHAPES: Record<string, string> = {
  aria:       'M12 2 L21.5 7.5 L21.5 16.5 L12 22 L2.5 16.5 L2.5 7.5 Z',
  celsius:    'M12 2 L19.5 8 L17 20 L7 20 L4.5 8 Z',
  nexus:      'M12 2 L22 12 L12 22 L2 12 Z',
  oracle:     'M12 2 L20 6 L22 15 L16 21 L8 21 L2 15 L4 6 Z',
  prometheus: 'M12 2 L22 8 L19 21 L5 21 L2 8 Z',
  quantum:    'M2 12 L7 2 L17 2 L22 12 L17 22 L7 22 Z',
  syndicate:  'M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z',
  void:       'M12 3 L21 20 L3 20 Z',
};

export function AgentAvatar({ agentId, name, color, size = 40, active = false }: Props) {
  const path = SHAPES[agentId] ?? SHAPES.aria;
  const glowStrength = active ? 8 : 2;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {active && (
        <span
          className="absolute inset-0 rounded-full animate-pulse-ring"
          style={{ backgroundColor: color, opacity: 0.25 }}
          aria-hidden
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: `drop-shadow(0 0 ${glowStrength}px ${color})` }}
        aria-label={name}
      >
        <path d={path} fill={`${color}18`} stroke={color} strokeWidth="1.2" />
        <text
          x="12"
          y="15.5"
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.22}
          fontFamily="'Major Mono Display', monospace"
          fontWeight="400"
        >
          {name[0]}
        </text>
      </svg>
    </div>
  );
}
