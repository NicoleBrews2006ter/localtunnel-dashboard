import {
  createTunnelGroup,
  addTunnelToGroup,
  removeTunnelFromGroup,
  deleteGroup,
  getGroup,
  listGroups,
  clearGroupStore,
} from './TunnelGroup';

beforeEach(() => {
  clearGroupStore();
});

describe('createTunnelGroup', () => {
  it('creates a group with a unique id and name', () => {
    const g = createTunnelGroup('production');
    expect(g.id).toMatch(/^group-/);
    expect(g.name).toBe('production');
    expect(g.tunnelIds).toEqual([]);
    expect(g.createdAt).toBeInstanceOf(Date);
  });

  it('accepts optional color and tunnelIds', () => {
    const g = createTunnelGroup('staging', { color: '#ff0', tunnelIds: ['t1', 't2'] });
    expect(g.color).toBe('#ff0');
    expect(g.tunnelIds).toEqual(['t1', 't2']);
  });
});

describe('addTunnelToGroup', () => {
  it('adds a tunnel id to the group', () => {
    const g = createTunnelGroup('dev');
    const ok = addTunnelToGroup(g.id, 'tunnel-abc');
    expect(ok).toBe(true);
    expect(getGroup(g.id)?.tunnelIds).toContain('tunnel-abc');
  });

  it('does not duplicate tunnel ids', () => {
    const g = createTunnelGroup('dev');
    addTunnelToGroup(g.id, 'tunnel-abc');
    addTunnelToGroup(g.id, 'tunnel-abc');
    expect(getGroup(g.id)?.tunnelIds.length).toBe(1);
  });

  it('returns false for unknown group', () => {
    expect(addTunnelToGroup('nonexistent', 'tunnel-abc')).toBe(false);
  });
});

describe('removeTunnelFromGroup', () => {
  it('removes a tunnel id from the group', () => {
    const g = createTunnelGroup('dev', { tunnelIds: ['t1', 't2'] });
    removeTunnelFromGroup(g.id, 't1');
    expect(getGroup(g.id)?.tunnelIds).toEqual(['t2']);
  });

  it('returns false for unknown group', () => {
    expect(removeTunnelFromGroup('nonexistent', 't1')).toBe(false);
  });
});

describe('deleteGroup', () => {
  it('removes the group from the store', () => {
    const g = createTunnelGroup('temp');
    expect(deleteGroup(g.id)).toBe(true);
    expect(getGroup(g.id)).toBeUndefined();
  });

  it('returns false when group does not exist', () => {
    expect(deleteGroup('ghost')).toBe(false);
  });
});

describe('listGroups', () => {
  it('returns all created groups', () => {
    createTunnelGroup('a');
    createTunnelGroup('b');
    expect(listGroups().length).toBe(2);
  });
});
