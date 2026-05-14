import { EventEmitter } from 'events';

export type TunnelStatus = 'connecting' | 'online' | 'offline' | 'error';

export interface TunnelEntry {
  id: string;
  name: string;
  subdomain?: string;
  url?: string;
  localPort: number;
  status: TunnelStatus;
  createdAt: Date;
  lastUpdatedAt: Date;
  errorMessage?: string;
}

class TunnelStore extends EventEmitter {
  private tunnels: Map<string, TunnelEntry> = new Map();

  add(entry: TunnelEntry): void {
    this.tunnels.set(entry.id, entry);
    this.emit('added', entry);
  }

  update(id: string, patch: Partial<TunnelEntry>): TunnelEntry | null {
    const existing = this.tunnels.get(id);
    if (!existing) return null;
    const updated: TunnelEntry = {
      ...existing,
      ...patch,
      id,
      lastUpdatedAt: new Date(),
    };
    this.tunnels.set(id, updated);
    this.emit('updated', updated);
    return updated;
  }

  remove(id: string): boolean {
    const entry = this.tunnels.get(id);
    if (!entry) return false;
    this.tunnels.delete(id);
    this.emit('removed', entry);
    return true;
  }

  get(id: string): TunnelEntry | undefined {
    return this.tunnels.get(id);
  }

  getAll(): TunnelEntry[] {
    return Array.from(this.tunnels.values());
  }

  clear(): void {
    this.tunnels.clear();
    this.emit('cleared');
  }
}

export const tunnelStore = new TunnelStore();
export default TunnelStore;
