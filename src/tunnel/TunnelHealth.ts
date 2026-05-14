import { EventEmitter } from 'events';
import { TunnelStore } from './TunnelStore';

export type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export interface TunnelHealthRecord {
  id: string;
  status: HealthStatus;
  lastChecked: Date | null;
  lastSuccess: Date | null;
  failureCount: number;
  latencyMs: number | null;
}

export class TunnelHealth extends EventEmitter {
  private healthMap = new Map<string, TunnelHealthRecord>();
  private store: TunnelStore;

  constructor(store: TunnelStore) {
    super();
    this.store = store;
  }

  getHealth(id: string): TunnelHealthRecord | undefined {
    return this.healthMap.get(id);
  }

  getAllHealth(): TunnelHealthRecord[] {
    return Array.from(this.healthMap.values());
  }

  recordSuccess(id: string, latencyMs: number): void {
    const existing = this.healthMap.get(id);
    const now = new Date();
    const updated: TunnelHealthRecord = {
      id,
      status: 'healthy',
      lastChecked: now,
      lastSuccess: now,
      failureCount: 0,
      latencyMs,
    };
    this.healthMap.set(id, updated);
    if (existing?.status !== 'healthy') {
      this.emit('statusChange', id, 'healthy', existing?.status ?? 'unknown');
    }
  }

  recordFailure(id: string): void {
    const existing = this.healthMap.get(id);
    const failureCount = (existing?.failureCount ?? 0) + 1;
    const status: HealthStatus = failureCount >= 3 ? 'down' : 'degraded';
    const updated: TunnelHealthRecord = {
      id,
      status,
      lastChecked: new Date(),
      lastSuccess: existing?.lastSuccess ?? null,
      failureCount,
      latencyMs: null,
    };
    this.healthMap.set(id, updated);
    if (existing?.status !== status) {
      this.emit('statusChange', id, status, existing?.status ?? 'unknown');
    }
  }

  remove(id: string): void {
    this.healthMap.delete(id);
  }

  reset(id: string): void {
    this.healthMap.delete(id);
  }
}
