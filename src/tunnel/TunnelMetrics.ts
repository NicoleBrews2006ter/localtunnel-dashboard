import { EventEmitter } from 'events';

export interface TunnelMetricsSnapshot {
  tunnelId: string;
  requestCount: number;
  bytesIn: number;
  bytesOut: number;
  errorCount: number;
  lastActivityAt: Date | null;
  uptimeMs: number;
}

export class TunnelMetrics extends EventEmitter {
  private requestCount = 0;
  private bytesIn = 0;
  private bytesOut = 0;
  private errorCount = 0;
  private lastActivityAt: Date | null = null;
  private startedAt: Date = new Date();

  constructor(private readonly tunnelId: string) {
    super();
  }

  recordRequest(inBytes = 0, outBytes = 0): void {
    this.requestCount += 1;
    this.bytesIn += inBytes;
    this.bytesOut += outBytes;
    this.lastActivityAt = new Date();
    this.emit('update', this.snapshot());
  }

  recordError(): void {
    this.errorCount += 1;
    this.lastActivityAt = new Date();
    this.emit('update', this.snapshot());
  }

  reset(): void {
    this.requestCount = 0;
    this.bytesIn = 0;
    this.bytesOut = 0;
    this.errorCount = 0;
    this.lastActivityAt = null;
    this.startedAt = new Date();
    this.emit('reset', this.tunnelId);
  }

  snapshot(): TunnelMetricsSnapshot {
    return {
      tunnelId: this.tunnelId,
      requestCount: this.requestCount,
      bytesIn: this.bytesIn,
      bytesOut: this.bytesOut,
      errorCount: this.errorCount,
      lastActivityAt: this.lastActivityAt,
      uptimeMs: Date.now() - this.startedAt.getTime(),
    };
  }
}
