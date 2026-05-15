/**
 * TunnelAlias — assign human-friendly aliases to tunnel IDs.
 */

export interface TunnelAlias {
  tunnelId: string;
  alias: string;
  createdAt: string;
}

export type AliasMap = Map<string, TunnelAlias>;

export function createAliasMap(): AliasMap {
  return new Map();
}

export function setAlias(
  map: AliasMap,
  tunnelId: string,
  alias: string
): TunnelAlias {
  const trimmed = alias.trim();
  if (!trimmed) {
    throw new Error("Alias must not be empty");
  }
  // Ensure alias is unique across all tunnels
  for (const [id, entry] of map.entries()) {
    if (entry.alias === trimmed && id !== tunnelId) {
      throw new Error(`Alias "${trimmed}" is already in use by tunnel "${id}"`);
    }
  }
  const record: TunnelAlias = {
    tunnelId,
    alias: trimmed,
    createdAt: new Date().toISOString(),
  };
  map.set(tunnelId, record);
  return record;
}

export function getAlias(map: AliasMap, tunnelId: string): TunnelAlias | undefined {
  return map.get(tunnelId);
}

export function deleteAlias(map: AliasMap, tunnelId: string): boolean {
  return map.delete(tunnelId);
}

export function resolveByAlias(
  map: AliasMap,
  alias: string
): TunnelAlias | undefined {
  for (const entry of map.values()) {
    if (entry.alias === alias) return entry;
  }
  return undefined;
}

export function listAliases(map: AliasMap): TunnelAlias[] {
  return Array.from(map.values());
}
