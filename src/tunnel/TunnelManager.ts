import localtunnel, { Tunnel } from 'localtunnel';

export interface TunnelConfig {
  id: string;
  port: number;
  subdomain?: string;
}

export interface TunnelSession {
  id: string;
  port: number;
  url: string;
  status: 'connecting' | 'open' | 'closed' | 'error';
  createdAt: Date;
  error?: string;
}

export class TunnelManager {
  private tunnels: Map<string, { session: TunnelSession; tunnel: Tunnel }> = new Map();

  async open(config: TunnelConfig): Promise<TunnelSession> {
    if (this.tunnels.has(config.id)) {
      throw new Error(`Tunnel with id "${config.id}" already exists`);
    }

    const session: TunnelSession = {
      id: config.id,
      port: config.port,
      url: '',
      status: 'connecting',
      createdAt: new Date(),
    };

    try {
      const tunnel = await localtunnel({
        port: config.port,
        subdomain: config.subdomain,
      });

      session.url = tunnel.url;
      session.status = 'open';

      tunnel.on('close', () => {
        const entry = this.tunnels.get(config.id);
        if (entry) entry.session.status = 'closed';
      });

      tunnel.on('error', (err: Error) => {
        const entry = this.tunnels.get(config.id);
        if (entry) {
          entry.session.status = 'error';
          entry.session.error = err.message;
        }
      });

      this.tunnels.set(config.id, { session, tunnel });
      return session;
    } catch (err: unknown) {
      session.status = 'error';
      session.error = err instanceof Error ? err.message : String(err);
      return session;
    }
  }

  async close(id: string): Promise<void> {
    const entry = this.tunnels.get(id);
    if (!entry) throw new Error(`Tunnel "${id}" not found`);
    entry.tunnel.close();
    entry.session.status = 'closed';
    this.tunnels.delete(id);
  }

  list(): TunnelSession[] {
    return Array.from(this.tunnels.values()).map((e) => e.session);
  }

  get(id: string): TunnelSession | undefined {
    return this.tunnels.get(id)?.session;
  }
}

export const tunnelManager = new TunnelManager();
