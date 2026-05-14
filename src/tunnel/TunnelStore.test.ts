import TunnelStore, { TunnelEntry } from './TunnelStore';

const makeEntry = (overrides: Partial<TunnelEntry> = {}): TunnelEntry => ({
  id: 'test-id',
  name: 'my-tunnel',
  localPort: 3000,
  status: 'connecting',
  createdAt: new Date('2024-01-01'),
  lastUpdatedAt: new Date('2024-01-01'),
  ...overrides,
});

describe('TunnelStore', () => {
  let store: TunnelStore;

  beforeEach(() => {
    store = new TunnelStore();
  });

  it('adds a tunnel entry and retrieves it', () => {
    const entry = makeEntry();
    store.add(entry);
    expect(store.get('test-id')).toEqual(entry);
  });

  it('returns all tunnel entries', () => {
    store.add(makeEntry({ id: 'a' }));
    store.add(makeEntry({ id: 'b' }));
    expect(store.getAll()).toHaveLength(2);
  });

  it('updates an existing entry', () => {
    store.add(makeEntry());
    const updated = store.update('test-id', { status: 'online', url: 'https://abc.loca.lt' });
    expect(updated?.status).toBe('online');
    expect(updated?.url).toBe('https://abc.loca.lt');
  });

  it('returns null when updating non-existent entry', () => {
    const result = store.update('missing', { status: 'error' });
    expect(result).toBeNull();
  });

  it('removes a tunnel entry', () => {
    store.add(makeEntry());
    const removed = store.remove('test-id');
    expect(removed).toBe(true);
    expect(store.get('test-id')).toBeUndefined();
  });

  it('returns false when removing non-existent entry', () => {
    expect(store.remove('ghost')).toBe(false);
  });

  it('emits events on add, update, and remove', () => {
    const addedMock = jest.fn();
    const updatedMock = jest.fn();
    const removedMock = jest.fn();
    store.on('added', addedMock);
    store.on('updated', updatedMock);
    store.on('removed', removedMock);

    store.add(makeEntry());
    store.update('test-id', { status: 'online' });
    store.remove('test-id');

    expect(addedMock).toHaveBeenCalledTimes(1);
    expect(updatedMock).toHaveBeenCalledTimes(1);
    expect(removedMock).toHaveBeenCalledTimes(1);
  });

  it('clears all entries', () => {
    store.add(makeEntry({ id: 'x' }));
    store.add(makeEntry({ id: 'y' }));
    store.clear();
    expect(store.getAll()).toHaveLength(0);
  });
});
