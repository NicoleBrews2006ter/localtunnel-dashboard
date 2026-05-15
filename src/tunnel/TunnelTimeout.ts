import { EventEmitter } from "events";

export interface TimeoutEntry {
  tunnelId: string;
  timeoutMs: number;
  startedAt: number;
  timerId: ReturnType<typeof setTimeout>;
}

export interface TunnelTimeoutEvents {
  timeout: (tunnelId: string) => void;
}

export class TunnelTimeout extends EventEmitter {
  private entries = new Map<string, TimeoutEntry>();

  constructor(private readonly defaultTimeoutMs = 30_000) {
    super();
  }

  start(tunnelId: string, timeoutMs = this.defaultTimeoutMs): void {
    this.cancel(tunnelId);

    const timerId = setTimeout(() => {
      this.entries.delete(tunnelId);
      this.emit("timeout", tunnelId);
    }, timeoutMs);

    this.entries.set(tunnelId, {
      tunnelId,
      timeoutMs,
      startedAt: Date.now(),
      timerId,
    });
  }

  cancel(tunnelId: string): boolean {
    const entry = this.entries.get(tunnelId);
    if (!entry) return false;
    clearTimeout(entry.timerId);
    this.entries.delete(tunnelId);
    return true;
  }

  reset(tunnelId: string): boolean {
    const entry = this.entries.get(tunnelId);
    if (!entry) return false;
    this.start(tunnelId, entry.timeoutMs);
    return true;
  }

  isActive(tunnelId: string): boolean {
    return this.entries.has(tunnelId);
  }

  getRemainingMs(tunnelId: string): number | null {
    const entry = this.entries.get(tunnelId);
    if (!entry) return null;
    const elapsed = Date.now() - entry.startedAt;
    return Math.max(0, entry.timeoutMs - elapsed);
  }

  activeIds(): string[] {
    return Array.from(this.entries.keys());
  }

  cancelAll(): void {
    for (const entry of this.entries.values()) {
      clearTimeout(entry.timerId);
    }
    this.entries.clear();
  }
}
