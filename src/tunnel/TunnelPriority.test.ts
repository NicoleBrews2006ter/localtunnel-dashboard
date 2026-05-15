import {
  createTunnelPriority,
  setPriority,
  getPriority,
  deletePriority,
  sortByPriority,
  listPriorities,
  TunnelPriority,
} from './TunnelPriority';

function makeMap(): Map<string, TunnelPriority> {
  return new Map();
}

describe('createTunnelPriority', () => {
  it('creates with default normal level', () => {
    const p = createTunnelPriority('t1');
    expect(p.tunnelId).toBe('t1');
    expect(p.level).toBe('normal');
    expect(p.updatedAt).toBeInstanceOf(Date);
  });

  it('creates with specified level', () => {
    const p = createTunnelPriority('t2', 'high');
    expect(p.level).toBe('high');
  });
});

describe('setPriority / getPriority', () => {
  it('sets and retrieves a priority', () => {
    const map = makeMap();
    setPriority(map, 't1', 'critical');
    const p = getPriority(map, 't1');
    expect(p?.level).toBe('critical');
  });

  it('returns undefined for unknown tunnel', () => {
    const map = makeMap();
    expect(getPriority(map, 'unknown')).toBeUndefined();
  });

  it('updates existing priority', () => {
    const map = makeMap();
    setPriority(map, 't1', 'low');
    setPriority(map, 't1', 'high');
    expect(getPriority(map, 't1')?.level).toBe('high');
  });
});

describe('deletePriority', () => {
  it('deletes an existing entry', () => {
    const map = makeMap();
    setPriority(map, 't1', 'low');
    expect(deletePriority(map, 't1')).toBe(true);
    expect(getPriority(map, 't1')).toBeUndefined();
  });

  it('returns false for non-existent entry', () => {
    const map = makeMap();
    expect(deletePriority(map, 'ghost')).toBe(false);
  });
});

describe('sortByPriority', () => {
  it('sorts tunnels by descending priority', () => {
    const map = makeMap();
    setPriority(map, 'a', 'low');
    setPriority(map, 'b', 'critical');
    setPriority(map, 'c', 'high');
    const sorted = sortByPriority(['a', 'b', 'c'], map);
    expect(sorted).toEqual(['b', 'c', 'a']);
  });

  it('treats missing priority as normal', () => {
    const map = makeMap();
    setPriority(map, 'a', 'low');
    const sorted = sortByPriority(['a', 'b'], map);
    expect(sorted[0]).toBe('b');
  });
});

describe('listPriorities', () => {
  it('returns all priority entries', () => {
    const map = makeMap();
    setPriority(map, 't1', 'high');
    setPriority(map, 't2', 'low');
    expect(listPriorities(map)).toHaveLength(2);
  });
});
