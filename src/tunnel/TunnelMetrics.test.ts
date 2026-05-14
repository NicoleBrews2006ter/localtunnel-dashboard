import { TunnelMetrics } from './TunnelMetrics';

describe('TunnelMetrics', () => {
  let metrics: TunnelMetrics;

  beforeEach(() => {
    metrics = new TunnelMetrics('tunnel-1');
  });

  it('starts with zero counters', () => {
    const snap = metrics.snapshot();
    expect(snap.requestCount).toBe(0);
    expect(snap.bytesIn).toBe(0);
    expect(snap.bytesOut).toBe(0);
    expect(snap.errorCount).toBe(0);
    expect(snap.lastActivityAt).toBeNull();
  });

  it('increments request count and bytes on recordRequest', () => {
    metrics.recordRequest(100, 200);
    const snap = metrics.snapshot();
    expect(snap.requestCount).toBe(1);
    expect(snap.bytesIn).toBe(100);
    expect(snap.bytesOut).toBe(200);
    expect(snap.lastActivityAt).toBeInstanceOf(Date);
  });

  it('accumulates multiple requests', () => {
    metrics.recordRequest(50, 80);
    metrics.recordRequest(30, 20);
    const snap = metrics.snapshot();
    expect(snap.requestCount).toBe(2);
    expect(snap.bytesIn).toBe(80);
    expect(snap.bytesOut).toBe(100);
  });

  it('increments error count on recordError', () => {
    metrics.recordError();
    expect(metrics.snapshot().errorCount).toBe(1);
  });

  it('emits update event on recordRequest', () => {
    const handler = jest.fn();
    metrics.on('update', handler);
    metrics.recordRequest(10, 10);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].requestCount).toBe(1);
  });

  it('emits update event on recordError', () => {
    const handler = jest.fn();
    metrics.on('update', handler);
    metrics.recordError();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('resets all counters and emits reset event', () => {
    metrics.recordRequest(100, 200);
    metrics.recordError();
    const resetHandler = jest.fn();
    metrics.on('reset', resetHandler);
    metrics.reset();
    const snap = metrics.snapshot();
    expect(snap.requestCount).toBe(0);
    expect(snap.bytesIn).toBe(0);
    expect(snap.errorCount).toBe(0);
    expect(snap.lastActivityAt).toBeNull();
    expect(resetHandler).toHaveBeenCalledWith('tunnel-1');
  });

  it('includes tunnelId in snapshot', () => {
    expect(metrics.snapshot().tunnelId).toBe('tunnel-1');
  });

  it('uptimeMs increases over time', async () => {
    const before = metrics.snapshot().uptimeMs;
    await new Promise((r) => setTimeout(r, 20));
    const after = metrics.snapshot().uptimeMs;
    expect(after).toBeGreaterThan(before);
  });
});
