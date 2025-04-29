export interface ModelOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface RequestPayload {
  messages: {
    role: 'system' | 'user';
    content: string;
  }[];
  model: string;
  response_format?: {
    type: 'json_schema';
    json_schema: {
      name: string;
      strict: boolean;
      schema: Record<string, unknown>;
    };
  };
}

export interface ResponseType {
  message: string;
  usage: {
    total_tokens: number;
  };
} 