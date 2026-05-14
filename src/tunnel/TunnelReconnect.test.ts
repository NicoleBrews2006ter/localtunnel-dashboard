import { TunnelReconnect } from './TunnelReconnect';

function flushTimers(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('TunnelReconnect', () => {
  let reconnect: TunnelReconnect;

  beforeEach(() => {
    jest.useFakeTimers();
    reconnect = new TunnelReconnect({ baseDelayMs: 100, maxDelayMs: 5000, backoffFactor: 2, maxAttempts: 3 });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls reconnectFn after delay and emits attempt', async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const attemptSpy = jest.fn();
    reconnect.on('attempt', attemptSpy);

    reconnect.schedule('t1', fn);
    jest.advanceTimersByTime(150);
    await Promise.resolve();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(attemptSpy).toHaveBeenCalledWith('t1', 1);
  });

  it('emits success when reconnectFn resolves', async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const successSpy = jest.fn();
    reconnect.on('success', successSpy);

    reconnect.schedule('t2', fn);
    jest.advanceTimersByTime(150);
    await Promise.resolve();
    await Promise.resolve();

    expect(successSpy).toHaveBeenCalledWith('t2', 1);
  });

  it('retries on failure and emits failure event', async () => {
    const err = new Error('connect failed');
    const fn = jest.fn().mockRejectedValue(err);
    const failureSpy = jest.fn();
    reconnect.on('failure', failureSpy);

    reconnect.schedule('t3', fn);
    jest.advanceTimersByTime(150);
    await Promise.resolve();
    await Promise.resolve();

    expect(failureSpy).toHaveBeenCalledWith('t3', 1, err);
  });

  it('emits give_up after maxAttempts exceeded', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    const giveUpSpy = jest.fn();
    reconnect.on('give_up', giveUpSpy);

    reconnect.schedule('t4', fn);

    for (let i = 0; i < 4; i++) {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
      await Promise.resolve();
    }

    expect(giveUpSpy).toHaveBeenCalledWith('t4', expect.any(Number));
  });

  it('stop cancels scheduled reconnect', () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    reconnect.schedule('t5', fn);
    reconnect.stop('t5');
    jest.advanceTimersByTime(5000);

    expect(fn).not.toHaveBeenCalled();
    expect(reconnect.getState('t5')).toBeUndefined();
  });

  it('getState returns undefined for unknown tunnel', () => {
    expect(reconnect.getState('unknown')).toBeUndefined();
  });
});
