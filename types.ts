
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  service: string;
}

export interface Action {
  id: number | string;
  target: string;
  action: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  details: string;
  started_at: string;
  completed_at?: string;
}

export interface PolicyCondition {
  type: 'metric_exceeds' | 'metric_below' | 'all' | 'any';
  metric: string;
  threshold: number;
}

export interface Policy {
  name: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  target: string;
  enabled: boolean;
  auto_remediate: boolean;
  condition?: PolicyCondition;
  action?: string;
  params?: Record<string, any>;
}

export interface QueueStats {
  queue_length: number;
  tasks_enqueued: number;
  tasks_dequeued: number;
  tasks_failed: number;
  tasks_completed: number;
  last_processed_task?: {
    task_id: string;
    action_id: number | string;
    target: string;
    timestamp: string;
  };
  queue_name: string;
}

export interface SimulatorStatus {
  running: boolean;
  rate: number;
  mode: string;
  events_generated: number;
  events_succeeded: number;
  events_failed: number;
  events_rate_limited: number;
  events_timeout: number;
  events_malformed: number;
  started_at: string;
  last_event_at: string;
  uptime_seconds: number;
}

export interface IngestResponse {
  ok: boolean;
  metric_id?: number;
  status: string;
  policies_evaluated: boolean;
  violations?: Array<{
    policy_name: string;
    severity: string;
    action: string;
  }>;
}

export interface EvaluationResult {
  ok: boolean;
  violations: Array<{
    policy_name: string;
    severity: string;
    description: string;
    target: string;
    timestamp: string;
  }>;
  actions_triggered: Array<{
    action: string;
    target: string;
    status: string;
    params: Record<string, any>;
  }>;
  timestamp: string;
}

export interface Settings {
  api_host: string;
  api_port: number;
  polling_interval: number;
  log_level: 'debug' | 'info' | 'warning' | 'error';
  max_concurrent_tasks: number;
  task_queue_size: number;
}
