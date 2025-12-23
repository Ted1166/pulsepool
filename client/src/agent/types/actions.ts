export interface ActionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  required: boolean;
}

export interface Action {
  name: string;
  description: string;
  parameters: ActionParameter[];
  execute: (params: Record<string, unknown>) => Promise<ActionResult>;
}

export interface ActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}
