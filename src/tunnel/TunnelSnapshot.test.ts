import { captureTunnelSnapshot, TunnelSnapshot } from './TunnelSnapshot';
import { TunnelStore } from './TunnelStore';
import { TunnelStatus } from './TunnelStatus';
import { TunnelHealth } from './TunnelHealth';
import { TunnelMetrics } from './TunnelMetrics';
import { createTunnelConfig } from './TunnelConfig';

function makeStore(ids: string[]): TunnelStore {
  const store = new TunnelStore();
  for (const id of ids) {
    store.add(createTunnelConfig({ id, subdomain: id, port: 3000 }));
  }
  return store;
}

describe('captureTunnelSnapshot', () => {
  it('returns a snapshot with capturedAt timestamp', () => {
    const store = makeStore(['t1']);
    const snap = captureTunnelSnapshot(store, new Map(), new Map(), new Map());
    expect(snap.capturedAt).toBeDefined();
    expect(new Date(snap.capturedAt).toISOString()).toBe(snap.capturedAt);
  });

  it('includes an entry for each tunnel in the store', () => {
    const store = makeStore(['t1', 't2']);
    const snap = captureTunnelSnapshot(store, new Map(), new Map(), new Map());
    expect(snap.tunnels).toHaveLength(2);
    expect(snap.tunnels.map((t) => t.id)).toEqual(expect.arrayContaining(['t1', 't2']));
  });

  it('defaults to unknown status and health when maps are empty', () => {
    const store = makeStore(['t1']);
    const snap = captureTunnelSnapshot(store, new Map(), new Map(), new Map());
    expect(snap.tunnels[0].status).toBe('unknown');
    expect(snap.tunnels[0].health).toBe('unknown');
    expect(snap.tunnels[0].requestCount).toBe(0);
    expect(snap.tunnels[0].errorCount).toBe(0);
    expect(snap.tunnels[0].uptime).toBeNull();
    expect(snap.tunnels[0].lastCheckedAt).toBeNull();
  });

  it('uses values from status, health, and metrics maps when present', () => {
    const store = makeStore(['t1']);

    const statusMock = { getState: () => 'connected', getUptime: () => 120 } as unknown as TunnelStatus;
    const healthMock = { getStatus: () => 'healthy', getLastCheckedAt: () => new Date('2024-01-01T00:00:00Z') } as unknown as TunnelHealth;
    const metricsMock = { getSnapshot: () => ({ requestCount: 42, errorCount: 3 }) } as unknown as TunnelMetrics;

    const snap = captureTunnelSnapshot(
      store,
      new Map([['t1', statusMock]]),
      new Map([['t1', healthMock]]),
      new Map([['t1', metricsMock]])
    );

    expect(snap.tunnels[0].status).toBe('connected');
    expect(snap.tunnels[0].health).toBe('healthy');
    expect(snap.tunnels[0].uptime).toBe(120);
    expect(snap.tunnels[0].requestCount).toBe(42);
    expect(snap.tunnels[0].errorCount).toBe(3);
    expect(snap.tunnels[0].lastCheckedAt).toBe('2024-01-01T00:00:00.000Z');
  });

  it('returns empty tunnels array when store is empty', () => {
    const store = new TunnelStore();
    const snap = captureTunnelSnapshot(store, new Map(), new Map(), new Map());
    expect(snap.tunnels).toHaveLength(0);
  });
});
