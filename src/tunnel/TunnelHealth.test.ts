import { TunnelHealth } from './TunnelHealth';
import { TunnelStore } from './TunnelStore';

function makeHealth() {
  const store = new TunnelStore();
  return new TunnelHealth(store);
}

describe('TunnelHealth', () => {
  it('returns undefined for unknown tunnel', () => {
    const health = makeHealth();
    expect(health.getHealth('nonexistent')).toBeUndefined();
  });

  it('records a success and marks tunnel as healthy', () => {
    const health = makeHealth();
    health.recordSuccess('t1', 42);
    const record = health.getHealth('t1');
    expect(record?.status).toBe('healthy');
    expect(record?.latencyMs).toBe(42);
    expect(record?.failureCount).toBe(0);
    expect(record?.lastSuccess).toBeInstanceOf(Date);
  });

  it('marks tunnel as degraded after first failure', () => {
    const health = makeHealth();
    health.recordFailure('t1');
    expect(health.getHealth('t1')?.status).toBe('degraded');
    expect(health.getHealth('t1')?.failureCount).toBe(1);
  });

  it('marks tunnel as down after 3 failures', () => {
    const health = makeHealth();
    health.recordFailure('t1');
    health.recordFailure('t1');
    health.recordFailure('t1');
    expect(health.getHealth('t1')?.status).toBe('down');
    expect(health.getHealth('t1')?.failureCount).toBe(3);
  });

  it('resets failure count on success', () => {
    const health = makeHealth();
    health.recordFailure('t1');
    health.recordFailure('t1');
    health.recordSuccess('t1', 10);
    expect(health.getHealth('t1')?.status).toBe('healthy');
    expect(health.getHealth('t1')?.failureCount).toBe(0);
  });

  it('emits statusChange event when status transitions', () => {
    const health = makeHealth();
    const handler = jest.fn();
    health.on('statusChange', handler);
    health.recordSuccess('t1', 5);
    expect(handler).toHaveBeenCalledWith('t1', 'healthy', 'unknown');
  });

  it('getAllHealth returns all records', () => {
    const health = makeHealth();
    health.recordSuccess('t1', 10);
    health.recordFailure('t2');
    const all = health.getAllHealth();
    expect(all).toHaveLength(2);
  });

  it('remove deletes a record', () => {
    const health = makeHealth();
    health.recordSuccess('t1', 10);
    health.remove('t1');
    expect(health.getHealth('t1')).toBeUndefined();
  });
});
