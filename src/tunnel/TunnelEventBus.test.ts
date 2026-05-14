import { TunnelEventBus } from './TunnelEventBus';
import { TUNNEL_EVENTS, TunnelOpenedPayload, TunnelErrorPayload } from './TunnelEvents';

let bus: TunnelEventBus;

beforeEach(() => {
  TunnelEventBus.reset();
  bus = TunnelEventBus.getInstance();
});

describe('TunnelEventBus', () => {
  it('returns the same singleton instance', () => {
    const a = TunnelEventBus.getInstance();
    const b = TunnelEventBus.getInstance();
    expect(a).toBe(b);
  });

  it('publishes and receives a tunnel:opened event', (done) => {
    const payload: TunnelOpenedPayload = {
      id: 'tunnel-1',
      url: 'https://example.loca.lt',
      localPort: 3000,
      openedAt: new Date(),
    };

    bus.subscribe(TUNNEL_EVENTS.OPENED, (received) => {
      expect(received).toEqual(payload);
      done();
    });

    bus.publish(TUNNEL_EVENTS.OPENED, payload);
  });

  it('returns an unsubscribe function that stops further events', () => {
    const handler = jest.fn();
    const unsubscribe = bus.subscribe(TUNNEL_EVENTS.CLOSED, handler);

    unsubscribe();

    bus.publish(TUNNEL_EVENTS.CLOSED, {
      id: 'tunnel-2',
      closedAt: new Date(),
      reason: 'manual',
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('delivers tunnel:error events with error details', (done) => {
    const err = new Error('connection refused');
    const payload: TunnelErrorPayload = {
      id: 'tunnel-3',
      error: err,
      occurredAt: new Date(),
    };

    bus.subscribe(TUNNEL_EVENTS.ERROR, (received) => {
      expect(received.id).toBe('tunnel-3');
      expect(received.error.message).toBe('connection refused');
      done();
    });

    bus.publish(TUNNEL_EVENTS.ERROR, payload);
  });

  it('supports multiple subscribers for the same event', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    bus.subscribe(TUNNEL_EVENTS.STATUS_CHANGE, handler1);
    bus.subscribe(TUNNEL_EVENTS.STATUS_CHANGE, handler2);

    bus.publish(TUNNEL_EVENTS.STATUS_CHANGE, {
      id: 'tunnel-4',
      previousStatus: 'connecting',
      currentStatus: 'open',
      changedAt: new Date(),
    });

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});
