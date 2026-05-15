/**
 * TunnelFilter — utilities for filtering tunnel lists by various criteria.
 */

import { TunnelConfig } from "./TunnelConfig";

export interface TunnelFilterCriteria {
  status?: string;
  tag?: string;
  group?: string;
  alias?: string;
  search?: string;
}

export interface FilterableTunnel {
  config: TunnelConfig;
  status?: string;
  tags?: string[];
  group?: string;
  alias?: string;
}

export function filterTunnels(
  tunnels: FilterableTunnel[],
  criteria: TunnelFilterCriteria
): FilterableTunnel[] {
  return tunnels.filter((tunnel) => {
    if (criteria.status && tunnel.status !== criteria.status) {
      return false;
    }

    if (criteria.tag) {
      const tags = tunnel.tags ?? [];
      if (!tags.includes(criteria.tag)) {
        return false;
      }
    }

    if (criteria.group && tunnel.group !== criteria.group) {
      return false;
    }

    if (criteria.alias && tunnel.alias !== criteria.alias) {
      return false;
    }

    if (criteria.search) {
      const needle = criteria.search.toLowerCase();
      const haystack = [
        tunnel.config.name ?? "",
        tunnel.config.subdomain ?? "",
        tunnel.alias ?? "",
        tunnel.group ?? "",
        ...(tunnel.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(needle)) {
        return false;
      }
    }

    return true;
  });
}

export function buildFilterCriteria(
  query: Record<string, string | undefined>
): TunnelFilterCriteria {
  const criteria: TunnelFilterCriteria = {};
  if (query.status) criteria.status = query.status;
  if (query.tag) criteria.tag = query.tag;
  if (query.group) criteria.group = query.group;
  if (query.alias) criteria.alias = query.alias;
  if (query.search) criteria.search = query.search;
  return criteria;
}
