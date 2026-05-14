import { EventEmitter } from 'events';
import {
  TUNNEL_EVENTS,
  TunnelEventName,
  TunnelOpenedPayload,
  TunnelClosedPayload,
  TunnelErrorPayload,
  TunnelRequestPayload,
  TunnelStatusChangePayload,
} from './TunnelEvents';

type EventMap = {
  [TUNNEL_EVENTS.OPENED]: TunnelOpenedPayload;
  [TUNNEL_EVENTS.CLOSED]: TunnelClosedPayload;
  [TUNNEL_EVENTS.ERROR]: TunnelErrorPayload;
  [TUNNEL_EVENTS.REQUEST]: TunnelRequestPayload;
  [TUNNEL_EVENTS.STATUS_CHANGE]: TunnelStatusChangePayload;
};

class TunnelEventBus extends EventEmitter {
  private static instance: TunnelEventBus;

  private constructor() {
    super();
    this.setMaxListeners(50);
  }

  static getInstance(): TunnelEventBus {
    if (!TunnelEventBus.instance) {
      TunnelEventBus.instance = new TunnelEventBus();
    }
    return TunnelEventBus.instance;
  }

  publish<E extends TunnelEventName>(event: E, payload: EventMap[E]): void {
    this.emit(event, payload);
  }

  subscribe<E extends TunnelEventName>(
    event: E,
    listener: (payload: EventMap[E]) => void
  ): () => void {
    this.on(event, listener as (...args: unknown[]) => void);
    return () => this.off(event, listener as (...args: unknown[]) => void);
  }

  /** Reset singleton — intended for testing only */
  static reset(): void {
    if (TunnelEventBus.instance) {
      TunnelEventBus.instance.removeAllListeners();
    }
    TunnelEventBus.instance = new TunnelEventBus();
  }
}

export const tunnelEventBus = TunnelEventBus.getInstance();
export { TunnelEventBus };
