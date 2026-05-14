/**
 * TunnelTags — lightweight tagging system for tunnel instances.
 * Tags allow grouping, filtering, and labelling tunnels by arbitrary string keys.
 */

export interface TunnelTagMap {
  [tunnelId: string]: Set<string>;
}

export class TunnelTags {
  private tags: TunnelTagMap = {};

  /** Add one or more tags to a tunnel. */
  addTags(tunnelId: string, ...newTags: string[]): void {
    if (!this.tags[tunnelId]) {
      this.tags[tunnelId] = new Set();
    }
    for (const tag of newTags) {
      const trimmed = tag.trim();
      if (trimmed.length === 0) continue;
      this.tags[tunnelId].add(trimmed);
    }
  }

  /** Remove a specific tag from a tunnel. */
  removeTag(tunnelId: string, tag: string): boolean {
    return this.tags[tunnelId]?.delete(tag) ?? false;
  }

  /** Replace all tags for a tunnel. */
  setTags(tunnelId: string, newTags: string[]): void {
    this.tags[tunnelId] = new Set(newTags.map((t) => t.trim()).filter(Boolean));
  }

  /** Get all tags for a tunnel as a sorted array. */
  getTags(tunnelId: string): string[] {
    return Array.from(this.tags[tunnelId] ?? []).sort();
  }

  /** Check whether a tunnel has a specific tag. */
  hasTag(tunnelId: string, tag: string): boolean {
    return this.tags[tunnelId]?.has(tag) ?? false;
  }

  /** Return all tunnel IDs that carry the given tag. */
  findByTag(tag: string): string[] {
    return Object.entries(this.tags)
      .filter(([, set]) => set.has(tag))
      .map(([id]) => id)
      .sort();
  }

  /** Remove all tag data for a tunnel (e.g. on tunnel removal). */
  clearTunnel(tunnelId: string): void {
    delete this.tags[tunnelId];
  }

  /** Serialise the full tag map to a plain object for API responses. */
  toJSON(): Record<string, string[]> {
    return Object.fromEntries(
      Object.entries(this.tags).map(([id, set]) => [id, Array.from(set).sort()])
    );
  }
}
