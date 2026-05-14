import { EventEmitter } from 'events';

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  tunnelId: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
}

export class TunnelLogger extends EventEmitter {
  private logs: Map<string, LogEntry[]> = new Map();
  private maxLogsPerTunnel: number;

  constructor(maxLogsPerTunnel = 100) {
    super();
    this.maxLogsPerTunnel = maxLogsPerTunnel;
  }

  log(tunnelId: string, level: LogLevel, message: string): void {
    const entry: LogEntry = {
      tunnelId,
      level,
      message,
      timestamp: new Date(),
    };

    if (!this.logs.has(tunnelId)) {
      this.logs.set(tunnelId, []);
    }

    const tunnelLogs = this.logs.get(tunnelId)!;
    tunnelLogs.push(entry);

    if (tunnelLogs.length > this.maxLogsPerTunnel) {
      tunnelLogs.shift();
    }

    this.emit('log', entry);
  }

  getLogsForTunnel(tunnelId: string): LogEntry[] {
    return this.logs.get(tunnelId) ?? [];
  }

  /**
   * Returns only the log entries for a tunnel that match the given level.
   */
  getLogsForTunnelByLevel(tunnelId: string, level: LogLevel): LogEntry[] {
    return this.getLogsForTunnel(tunnelId).filter((entry) => entry.level === level);
  }

  clearLogsForTunnel(tunnelId: string): void {
    this.logs.delete(tunnelId);
  }

  getAllLogs(): LogEntry[] {
    const all: LogEntry[] = [];
    for (const entries of this.logs.values()) {
      all.push(...entries);
    }
    return all.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}
