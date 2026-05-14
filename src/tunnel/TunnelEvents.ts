export const TUNNEL_EVENTS = {
  OPENED: 'tunnel:opened',
  CLOSED: 'tunnel:closed',
  ERROR: 'tunnel:error',
  REQUEST: 'tunnel:request',
  STATUS_CHANGE: 'tunnel:status_change',
} as const;

export type TunnelEventName = (typeof TUNNEL_EVENTS)[keyof typeof TUNNEL_EVENTS];

export interface TunnelOpenedPayload {
  id: string;
  url: string;
  localPort: number;
  openedAt: Date;
}

export interface TunnelClosedPayload {
  id: string;
  closedAt: Date;
  reason?: string;
}

export interface TunnelErrorPayload {
  id: string;
  error: Error;
  occurredAt: Date;
}

export interface TunnelRequestPayload {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
}

export interface TunnelStatusChangePayload {
  id: string;
  previousStatus: string;
  currentStatus: string;
  changedAt: Date;
}

export type TunnelEventPayload =
  | TunnelOpenedPayload
  | TunnelClosedPayload
  | TunnelErrorPayload
  | TunnelRequestPayload
  | TunnelStatusChangePayload;
