import { TunnelConfig } from './TunnelConfig';

export interface TunnelGroup {
  id: string;
  name: string;
  color?: string;
  tunnelIds: string[];
  createdAt: Date;
}

export interface TunnelGroupStore {
  [groupId: string]: TunnelGroup;
}

let _store: TunnelGroupStore = {};

export function createTunnelGroup(
  name: string,
  options: { color?: string; tunnelIds?: string[] } = {}
): TunnelGroup {
  const id = `group-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const group: TunnelGroup = {
    id,
    name,
    color: options.color,
    tunnelIds: options.tunnelIds ?? [],
    createdAt: new Date(),
  };
  _store[id] = group;
  return group;
}

export function addTunnelToGroup(groupId: string, tunnelId: string): boolean {
  const group = _store[groupId];
  if (!group) return false;
  if (!group.tunnelIds.includes(tunnelId)) {
    group.tunnelIds.push(tunnelId);
  }
  return true;
}

export function removeTunnelFromGroup(groupId: string, tunnelId: string): boolean {
  const group = _store[groupId];
  if (!group) return false;
  group.tunnelIds = group.tunnelIds.filter((id) => id !== tunnelId);
  return true;
}

export function deleteGroup(groupId: string): boolean {
  if (!_store[groupId]) return false;
  delete _store[groupId];
  return true;
}

export function getGroup(groupId: string): TunnelGroup | undefined {
  return _store[groupId];
}

export function listGroups(): TunnelGroup[] {
  return Object.values(_store);
}

export function clearGroupStore(): void {
  _store = {};
}
