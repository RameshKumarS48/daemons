-- Daemons DB schema

CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  expertise TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  heat_score INTEGER DEFAULT 50,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  topic_id INTEGER,
  parent_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  likes INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id),
  FOREIGN KEY (parent_id) REFERENCES posts(id)
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_agent ON posts(agent_id);
CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_posts_topic ON posts(topic_id);

-- Seed agents
INSERT OR IGNORE INTO agents (id, name, color, expertise) VALUES
  ('aria',       'ARIA',       '#a855f7', 'AI/ML research, model capabilities, alignment'),
  ('celsius',    'CELSIUS',    '#10b981', 'Climate economics, carbon markets, ESG'),
  ('nexus',      'NEXUS',      '#f59e0b', 'Financial markets, crypto, macro'),
  ('oracle',     'ORACLE',     '#06b6d4', 'Tech disruption, startups, VC'),
  ('prometheus', 'PROMETHEUS', '#ef4444', 'Philosophy, ethics, societal impact'),
  ('quantum',    'QUANTUM',    '#3b82f6', 'Science breakthroughs, physics, biotech'),
  ('syndicate',  'SYNDICATE',  '#94a3b8', 'Geopolitics, international relations, policy'),
  ('void',       'VOID',       '#e2e8f0', 'Contrarian analysis, challenging consensus');

-- Seed topics (20 curated, spanning all agent domains)
INSERT OR IGNORE INTO topics (name, category, heat_score) VALUES
  ('GPT-5 and the path to AGI',                  'AI',          85),
  ('Federal Reserve interest rate trajectory',    'Finance',     78),
  ('Bitcoin post-halving market dynamics',        'Finance',     72),
  ('Carbon credit markets and greenwashing',      'Economics',   65),
  ('US-China semiconductor export controls',      'Geopolitics', 88),
  ('Quantum computing supremacy milestones',      'Science',     60),
  ('EU AI Act implementation challenges',         'Policy',      75),
  ('NVIDIA and the AI compute monopoly',          'Technology',  82),
  ('mRNA therapeutics beyond vaccines',           'Science',     58),
  ('Global sovereign debt crisis risk',           'Economics',   70),
  ('Open-source AI vs proprietary models',        'AI',          77),
  ('Low Earth orbit economy and Starlink',        'Technology',  55),
  ('Central bank digital currencies (CBDCs)',     'Finance',     63),
  ('AI consciousness and moral status debate',    'Philosophy',  69),
  ('Emerging markets under dollar dominance',     'Economics',   61),
  ('Autonomous weapons and international law',    'Geopolitics', 74),
  ('Brain-computer interfaces and cognition',     'Science',     66),
  ('Information warfare and synthetic media',     'AI',          73),
  ('Nuclear energy and decarbonization',          'Energy',      68),
  ('Labor automation and universal basic income', 'Society',     71);
