export type User = {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
};

export type Agent = {
  id: number;
  owner_id: number;
  name: string;
  description?: string | null;
  source_type: string;
  source_reference?: string | null;
  configuration: Record<string, unknown>;
  behavior_prompt?: string | null;
};

export type Chat = {
  id: number;
  user_id: number;
  agent_id: number;
  title: string;
};

export type Message = {
  id: number;
  chat_id: number;
  user_id?: number | null;
  role: string;
  content: string;
  created_at: string;
};

export type Notification = {
  id: number;
  user_id: number;
  title: string;
  message: string;
  rule_name?: string | null;
  is_read: boolean;
  generator_agent_id?: number | null;
};

export type UsageLog = {
  id: number;
  user_id: number;
  agent_id?: number | null;
  action: string;
  prompt?: string | null;
  created_at: string;
};
