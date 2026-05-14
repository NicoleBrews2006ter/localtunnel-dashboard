import { TunnelStore } from './TunnelStore';
import { TunnelStatus } from './TunnelStatus';
import { TunnelHealth } from './TunnelHealth';
import { TunnelMetrics } from './TunnelMetrics';

export interface TunnelSnapshotEntry {
  id: string;
  url: string | null;
  status: string;
  health: string;
  uptime: number | null;
  requestCount: number;
  errorCount: number;
  lastCheckedAt: string | null;
}

export interface TunnelSnapshot {
  capturedAt: string;
  tunnels: TunnelSnapshotEntry[];
}

export function captureTunnelSnapshot(
  store: TunnelStore,
  statusMap: Map<string, TunnelStatus>,
  healthMap: Map<string, TunnelHealth>,
  metricsMap: Map<string, TunnelMetrics>
): TunnelSnapshot {
  const tunnels = store.getAll().map((config) => {
    const id = config.id;
    const status = statusMap.get(id);
    const health = healthMap.get(id);
    const metrics = metricsMap.get(id);

    const requestCount = metrics?.getSnapshot().requestCount ?? 0;
    const errorCount = metrics?.getSnapshot().errorCount ?? 0;
    const lastCheckedAt = health?.getLastCheckedAt()?.toISOString() ?? null;
    const uptime = status?.getUptime() ?? null;

    return {
      id,
      url: config.url ?? null,
      status: status?.getState() ?? 'unknown',
      health: health?.getStatus() ?? 'unknown',
      uptime,
      requestCount,
      errorCount,
      lastCheckedAt,
    };
  });

  return {
    capturedAt: new Date().toISOString(),
    tunnels,
  };
}
