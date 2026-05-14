export type TunnelState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface TunnelStatusSnapshot {
  id: string;
  url: string | null;
  state: TunnelState;
  connectedAt: Date | null;
  disconnectedAt: Date | null;
  errorMessage: string | null;
  uptime: number | null; // milliseconds
}

export class TunnelStatus {
  private id: string;
  private url: string | null = null;
  private state: TunnelState = 'disconnected';
  private connectedAt: Date | null = null;
  private disconnectedAt: Date | null = null;
  private errorMessage: string | null = null;

  constructor(id: string) {
    this.id = id;
  }

  setConnecting(): void {
    this.state = 'connecting';
    this.errorMessage = null;
  }

  setConnected(url: string): void {
    this.state = 'connected';
    this.url = url;
    this.connectedAt = new Date();
    this.disconnectedAt = null;
    this.errorMessage = null;
  }

  setDisconnected(): void {
    this.state = 'disconnected';
    this.disconnectedAt = new Date();
  }

  setError(message: string): void {
    this.state = 'error';
    this.errorMessage = message;
    this.disconnectedAt = new Date();
  }

  getState(): TunnelState {
    return this.state;
  }

  getSnapshot(): TunnelStatusSnapshot {
    const uptime =
      this.state === 'connected' && this.connectedAt
        ? Date.now() - this.connectedAt.getTime()
        : null;

    return {
      id: this.id,
      url: this.url,
      state: this.state,
      connectedAt: this.connectedAt,
      disconnectedAt: this.disconnectedAt,
      errorMessage: this.errorMessage,
      uptime,
    };
  }
}
