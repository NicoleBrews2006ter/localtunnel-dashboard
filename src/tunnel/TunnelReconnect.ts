import { EventEmitter } from 'events';

export interface ReconnectOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
}

export interface ReconnectState {
  tunnelId: string;
  attempts: number;
  lastAttemptAt: Date | null;
  nextAttemptAt: Date | null;
  stopped: boolean;
}

const DEFAULT_OPTIONS: ReconnectOptions = {
  maxAttempts: 5,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffFactor: 2,
};

export class TunnelReconnect extends EventEmitter {
  private states = new Map<string, ReconnectState>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private options: ReconnectOptions;

  constructor(options: Partial<ReconnectOptions> = {}) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  schedule(tunnelId: string, reconnectFn: () => Promise<void>): void {
    const state = this.states.get(tunnelId) ?? {
      tunnelId,
      attempts: 0,
      lastAttemptAt: null,
      nextAttemptAt: null,
      stopped: false,
    };

    if (state.stopped || state.attempts >= this.options.maxAttempts) {
      this.emit('give_up', tunnelId, state.attempts);
      this.clear(tunnelId);
      return;
    }

    const delay = Math.min(
      this.options.baseDelayMs * Math.pow(this.options.backoffFactor, state.attempts),
      this.options.maxDelayMs
    );

    state.nextAttemptAt = new Date(Date.now() + delay);
    this.states.set(tunnelId, state);

    const timer = setTimeout(async () => {
      state.attempts += 1;
      state.lastAttemptAt = new Date();
      state.nextAttemptAt = null;
      this.emit('attempt', tunnelId, state.attempts);
      try {
        await reconnectFn();
        this.emit('success', tunnelId, state.attempts);
        this.clear(tunnelId);
      } catch (err) {
        this.emit('failure', tunnelId, state.attempts, err);
        this.schedule(tunnelId, reconnectFn);
      }
    }, delay);

    this.timers.set(tunnelId, timer);
  }

  stop(tunnelId: string): void {
    const state = this.states.get(tunnelId);
    if (state) {
      state.stopped = true;
    }
    this.clear(tunnelId);
  }

  getState(tunnelId: string): ReconnectState | undefined {
    return this.states.get(tunnelId);
  }

  private clear(tunnelId: string): void {
    const timer = this.timers.get(tunnelId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(tunnelId);
    }
    this.states.delete(tunnelId);
  }
}
