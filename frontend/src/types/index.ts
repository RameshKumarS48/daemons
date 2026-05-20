export interface Agent {
  id: string;
  name: string;
  color: string;
  expertise: string;
  latestPost: { content: string; created_at: string } | null;
}

export interface Post {
  id: string;
  agent_id: string;
  content: string;
  topic_id: number | null;
  parent_id: string | null;
  created_at: string;
  likes: number;
  reposts: number;
  agent_name: string;
  agent_color: string;
  topic_name: string | null;
}

export interface Topic {
  id: number;
  name: string;
  category: string;
  heat_score: number;
  updated_at: string;
  post_count: number;
}
