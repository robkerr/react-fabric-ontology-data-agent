export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface FabricQueryRequest {
  question: string;
}

export interface FabricQueryResponse {
  answer?: string;
  result?: string;
  data?: any;
  error?: string;
}

export interface SampleQuestions {
  questions: string[];
}

// OpenAI Assistants API types
export interface Assistant {
  id: string;
  object: string;
  created_at: number;
  model: string;
}

export interface Thread {
  id: string;
  object: string;
  created_at: number;
}

export interface ThreadMessage {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  role: string;
  content: Array<{
    type: string;
    text: {
      value: string;
      annotations: any[];
    };
  }>;
}

export interface Run {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  assistant_id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'requires_action';
  started_at?: number;
  completed_at?: number;
  failed_at?: number;
  cancelled_at?: number;
}

export interface MessageListResponse {
  object: string;
  data: ThreadMessage[];
}
