export type PauseState = "paused" | "active";

export interface TunnelPauseEntry {
  tunnelId: string;
  state: PauseState;
  pausedAt?: Date;
  resumedAt?: Date;
}

export type PauseMap = Map<string, TunnelPauseEntry>;

export function createPauseMap(): PauseMap {
  return new Map();
}

export function pauseTunnel(map: PauseMap, tunnelId: string): TunnelPauseEntry {
  const existing = map.get(tunnelId);
  if (existing?.state === "paused") {
    return existing;
  }
  const entry: TunnelPauseEntry = {
    tunnelId,
    state: "paused",
    pausedAt: new Date(),
    resumedAt: undefined,
  };
  map.set(tunnelId, entry);
  return entry;
}

export function resumeTunnel(map: PauseMap, tunnelId: string): TunnelPauseEntry {
  const existing = map.get(tunnelId);
  if (existing?.state === "active") {
    return existing;
  }
  const entry: TunnelPauseEntry = {
    tunnelId,
    state: "active",
    pausedAt: existing?.pausedAt,
    resumedAt: new Date(),
  };
  map.set(tunnelId, entry);
  return entry;
}

export function getPauseState(map: PauseMap, tunnelId: string): PauseState {
  return map.get(tunnelId)?.state ?? "active";
}

export function isPaused(map: PauseMap, tunnelId: string): boolean {
  return getPauseState(map, tunnelId) === "paused";
}

export function deletePauseEntry(map: PauseMap, tunnelId: string): boolean {
  return map.delete(tunnelId);
}

export function listPausedTunnels(map: PauseMap): TunnelPauseEntry[] {
  return Array.from(map.values()).filter((e) => e.state === "paused");
}
