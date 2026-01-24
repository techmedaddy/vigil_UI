
import { 
  SystemHealth, 
  Action, 
  Policy, 
  QueueStats, 
  SimulatorStatus, 
  IngestResponse, 
  EvaluationResult,
  Settings 
} from '../types';

const BASE_URL = 'http://localhost:8000';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API error: ${response.status}`);
    }

    return response.json();
  }

  // System
  async getHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>('/health');
  }

  // Actions
  async getActions(limit = 50): Promise<{ count: number; actions: Action[] }> {
    return this.request<{ count: number; actions: Action[] }>(`/api/v1/actions?limit=${limit}`);
  }

  async getAction(id: string | number): Promise<Action> {
    return this.request<Action>(`/api/v1/actions/${id}`);
  }

  async getActionsByStatus(status: string): Promise<{ count: number; actions: Action[] }> {
    return this.request<{ count: number; actions: Action[] }>(`/api/v1/actions/status/${status}`);
  }

  async createAction(data: { target: string; action: string; status?: string; details?: string }): Promise<{ ok: boolean; action_id: number; message: string }> {
    return this.request<{ ok: boolean; action_id: number; message: string }>('/api/v1/actions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Metrics Ingestion
  async ingestMetric(data: { name: string; value: number; tags: Record<string, string> }): Promise<IngestResponse> {
    return this.request<IngestResponse>('/api/v1/ingest', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Policies
  async getPolicies(): Promise<{ ok: boolean; policies: Record<string, Policy>; total: number; enabled_count: number }> {
    return this.request<{ ok: boolean; policies: Record<string, Policy>; total: number; enabled_count: number }>('/api/v1/policies');
  }

  async createPolicy(policy: Policy): Promise<Policy> {
    return this.request<Policy>('/api/v1/policies', {
      method: 'POST',
      body: JSON.stringify(policy),
    });
  }

  async updatePolicy(name: string, data: Partial<Policy>): Promise<Policy> {
    return this.request<Policy>(`/api/v1/policies/${name}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePolicy(name: string): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>(`/api/v1/policies/${name}`, {
      method: 'DELETE',
    });
  }

  async enablePolicy(name: string): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>(`/api/v1/policies/${name}/enable`, {
      method: 'PUT',
    });
  }

  async disablePolicy(name: string): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>(`/api/v1/policies/${name}/disable`, {
      method: 'PUT',
    });
  }

  async evaluatePolicies(data: { metrics: Record<string, number>; target: string }): Promise<EvaluationResult> {
    return this.request<EvaluationResult>('/api/v1/policies/evaluate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Policy Tester - inject test metric for a specific policy
  async injectTestMetric(policyId: string): Promise<{ ok: boolean; message: string }> {
    return this.request<{ ok: boolean; message: string }>('/api/v1/policy-tester/inject', {
      method: 'POST',
      body: JSON.stringify({ policy_id: policyId }),
    });
  }

  // Queue - uses /api/v1/queue/status endpoint
  async getQueueStats(): Promise<QueueStats> {
    try {
      return await this.request<QueueStats>('/api/v1/queue/status');
    } catch (error) {
      // Endpoint not available, return fallback data
      console.warn('Queue status endpoint error, using fallback data');
      return {
        queue_depth: 0,
        completed: 0,
        failed: 0,
        success_rate: 0,
        history: []
      };
    }
  }

  // Simulator (currently UI router - graceful fallback to mock data if not implemented)
  async startSimulator(config: any): Promise<{ ok: boolean; message: string }> {
    try {
      return await this.request<{ ok: boolean; message: string }>('/api/v1/ui/simulator/start', {
        method: 'POST',
        body: JSON.stringify(config),
      });
    } catch (error) {
      console.warn('Simulator start endpoint not implemented, using mock response');
      return {
        ok: true,
        message: 'Simulator endpoint not yet implemented - this is a mock response'
      };
    }
  }

  async stopSimulator(): Promise<{ ok: boolean; message: string }> {
    try {
      return await this.request<{ ok: boolean; message: string }>('/api/v1/ui/simulator/stop', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Simulator stop endpoint not implemented, using mock response');
      return {
        ok: true,
        message: 'Simulator endpoint not yet implemented - this is a mock response'
      };
    }
  }

  async getSimulatorStatus(): Promise<SimulatorStatus> {
    try {
      return await this.request<SimulatorStatus>('/api/v1/ui/simulator/status');
    } catch (error) {
      console.warn('Simulator status endpoint not implemented, using mock data');
      return {
        running: false,
        rate: 0,
        mode: 'steady',
        events_generated: 0,
        events_succeeded: 0,
        events_failed: 0,
        events_rate_limited: 0,
        events_timeout: 0,
        events_malformed: 0,
        started_at: new Date().toISOString(),
        last_event_at: new Date().toISOString(),
        uptime_seconds: 0
      };
    }
  }

  // Settings
  async getSettings(): Promise<Settings> {
    try {
      return await this.request<Settings>('/api/v1/settings');
    } catch (error) {
      console.warn('Settings endpoint not implemented, using default values');
      return {
        api_host: 'localhost',
        api_port: 8000,
        polling_interval: 5000,
        log_level: 'info',
        max_concurrent_tasks: 10,
        task_queue_size: 100
      };
    }
  }

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    try {
      return await this.request<Settings>('/api/v1/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.warn('Settings update endpoint not implemented, returning submitted values');
      const currentSettings = await this.getSettings();
      return { ...currentSettings, ...settings };
    }
  }
}

export const api = new ApiService();
