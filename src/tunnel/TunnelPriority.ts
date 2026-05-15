export type PriorityLevel = 'low' | 'normal' | 'high' | 'critical';

export interface TunnelPriority {
  tunnelId: string;
  level: PriorityLevel;
  updatedAt: Date;
}

const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  low: 0,
  normal: 1,
  high: 2,
  critical: 3,
};

export function createTunnelPriority(
  tunnelId: string,
  level: PriorityLevel = 'normal'
): TunnelPriority {
  return { tunnelId, level, updatedAt: new Date() };
}

export function setPriority(
  map: Map<string, TunnelPriority>,
  tunnelId: string,
  level: PriorityLevel
): TunnelPriority {
  const entry: TunnelPriority = { tunnelId, level, updatedAt: new Date() };
  map.set(tunnelId, entry);
  return entry;
}

export function getPriority(
  map: Map<string, TunnelPriority>,
  tunnelId: string
): TunnelPriority | undefined {
  return map.get(tunnelId);
}

export function deletePriority(
  map: Map<string, TunnelPriority>,
  tunnelId: string
): boolean {
  return map.delete(tunnelId);
}

export function sortByPriority(
  tunnelIds: string[],
  map: Map<string, TunnelPriority>
): string[] {
  return [...tunnelIds].sort((a, b) => {
    const pa = PRIORITY_ORDER[map.get(a)?.level ?? 'normal'];
    const pb = PRIORITY_ORDER[map.get(b)?.level ?? 'normal'];
    return pb - pa;
  });
}

export function listPriorities(
  map: Map<string, TunnelPriority>
): TunnelPriority[] {
  return Array.from(map.values());
}
