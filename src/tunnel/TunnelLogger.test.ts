import { TunnelLogger, LogEntry } from './TunnelLogger';

describe('TunnelLogger', () => {
  let logger: TunnelLogger;

  beforeEach(() => {
    logger = new TunnelLogger(5);
  });

  it('should log an entry and retrieve it', () => {
    logger.log('tunnel-1', 'info', 'Tunnel connected');
    const logs = logger.getLogsForTunnel('tunnel-1');
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('Tunnel connected');
    expect(logs[0].level).toBe('info');
    expect(logs[0].tunnelId).toBe('tunnel-1');
  });

  it('should return empty array for unknown tunnel', () => {
    expect(logger.getLogsForTunnel('unknown')).toEqual([]);
  });

  it('should cap logs at maxLogsPerTunnel', () => {
    for (let i = 0; i < 7; i++) {
      logger.log('tunnel-1', 'info', `Message ${i}`);
    }
    const logs = logger.getLogsForTunnel('tunnel-1');
    expect(logs).toHaveLength(5);
    expect(logs[0].message).toBe('Message 2');
  });

  it('should emit a log event on each log call', () => {
    const handler = jest.fn();
    logger.on('log', handler);
    logger.log('tunnel-1', 'warn', 'Something happened');
    expect(handler).toHaveBeenCalledTimes(1);
    const entry: LogEntry = handler.mock.calls[0][0];
    expect(entry.level).toBe('warn');
  });

  it('should clear logs for a specific tunnel', () => {
    logger.log('tunnel-1', 'info', 'Hello');
    logger.clearLogsForTunnel('tunnel-1');
    expect(logger.getLogsForTunnel('tunnel-1')).toEqual([]);
  });

  it('should return all logs sorted by timestamp', () => {
    logger.log('tunnel-2', 'info', 'Second tunnel log');
    logger.log('tunnel-1', 'error', 'First tunnel log');
    const all = logger.getAllLogs();
    expect(all).toHaveLength(2);
    expect(all[0].timestamp.getTime()).toBeLessThanOrEqual(all[1].timestamp.getTime());
  });
});
