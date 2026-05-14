import { TunnelStatus } from './TunnelStatus';

describe('TunnelStatus', () => {
  let status: TunnelStatus;

  beforeEach(() => {
    status = new TunnelStatus('tunnel-1');
  });

  it('starts in disconnected state', () => {
    const snap = status.getSnapshot();
    expect(snap.state).toBe('disconnected');
    expect(snap.url).toBeNull();
    expect(snap.connectedAt).toBeNull();
    expect(snap.uptime).toBeNull();
  });

  it('transitions to connecting state', () => {
    status.setConnecting();
    expect(status.getState()).toBe('connecting');
    const snap = status.getSnapshot();
    expect(snap.state).toBe('connecting');
    expect(snap.errorMessage).toBeNull();
  });

  it('transitions to connected state with url', () => {
    status.setConnected('https://abc.loca.lt');
    const snap = status.getSnapshot();
    expect(snap.state).toBe('connected');
    expect(snap.url).toBe('https://abc.loca.lt');
    expect(snap.connectedAt).toBeInstanceOf(Date);
    expect(snap.disconnectedAt).toBeNull();
  });

  it('calculates uptime when connected', async () => {
    status.setConnected('https://abc.loca.lt');
    await new Promise((r) => setTimeout(r, 20));
    const snap = status.getSnapshot();
    expect(snap.uptime).not.toBeNull();
    expect(snap.uptime as number).toBeGreaterThanOrEqual(10);
  });

  it('transitions to disconnected state', () => {
    status.setConnected('https://abc.loca.lt');
    status.setDisconnected();
    const snap = status.getSnapshot();
    expect(snap.state).toBe('disconnected');
    expect(snap.disconnectedAt).toBeInstanceOf(Date);
    expect(snap.uptime).toBeNull();
  });

  it('transitions to error state with message', () => {
    status.setError('connection refused');
    const snap = status.getSnapshot();
    expect(snap.state).toBe('error');
    expect(snap.errorMessage).toBe('connection refused');
    expect(snap.disconnectedAt).toBeInstanceOf(Date);
  });

  it('clears error message on reconnect', () => {
    status.setError('timeout');
    status.setConnecting();
    expect(status.getSnapshot().errorMessage).toBeNull();
  });

  it('snapshot includes correct id', () => {
    expect(status.getSnapshot().id).toBe('tunnel-1');
  });
});
