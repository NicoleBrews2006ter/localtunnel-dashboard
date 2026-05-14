import { TunnelTags } from './TunnelTags';

describe('TunnelTags', () => {
  let tags: TunnelTags;

  beforeEach(() => {
    tags = new TunnelTags();
  });

  it('adds tags to a tunnel', () => {
    tags.addTags('t1', 'prod', 'web');
    expect(tags.getTags('t1')).toEqual(['prod', 'web']);
  });

  it('ignores empty or whitespace-only tags', () => {
    tags.addTags('t1', '', '  ', 'valid');
    expect(tags.getTags('t1')).toEqual(['valid']);
  });

  it('deduplicates tags', () => {
    tags.addTags('t1', 'alpha');
    tags.addTags('t1', 'alpha', 'beta');
    expect(tags.getTags('t1')).toEqual(['alpha', 'beta']);
  });

  it('removes a specific tag', () => {
    tags.addTags('t1', 'a', 'b');
    const removed = tags.removeTag('t1', 'a');
    expect(removed).toBe(true);
    expect(tags.getTags('t1')).toEqual(['b']);
  });

  it('returns false when removing a non-existent tag', () => {
    expect(tags.removeTag('t1', 'ghost')).toBe(false);
  });

  it('replaces all tags with setTags', () => {
    tags.addTags('t1', 'old1', 'old2');
    tags.setTags('t1', ['new1', 'new2']);
    expect(tags.getTags('t1')).toEqual(['new1', 'new2']);
  });

  it('hasTag returns correct boolean', () => {
    tags.addTags('t1', 'present');
    expect(tags.hasTag('t1', 'present')).toBe(true);
    expect(tags.hasTag('t1', 'absent')).toBe(false);
  });

  it('findByTag returns all tunnel IDs with that tag', () => {
    tags.addTags('t1', 'group-a');
    tags.addTags('t2', 'group-a', 'group-b');
    tags.addTags('t3', 'group-b');
    expect(tags.findByTag('group-a')).toEqual(['t1', 't2']);
    expect(tags.findByTag('group-b')).toEqual(['t2', 't3']);
  });

  it('clearTunnel removes all tags for that tunnel', () => {
    tags.addTags('t1', 'x');
    tags.clearTunnel('t1');
    expect(tags.getTags('t1')).toEqual([]);
    expect(tags.findByTag('x')).toEqual([]);
  });

  it('toJSON serialises the full map', () => {
    tags.addTags('t1', 'z', 'a');
    tags.addTags('t2', 'm');
    const json = tags.toJSON();
    expect(json).toEqual({ t1: ['a', 'z'], t2: ['m'] });
  });

  it('returns empty array for unknown tunnel in getTags', () => {
    expect(tags.getTags('unknown')).toEqual([]);
  });
});
