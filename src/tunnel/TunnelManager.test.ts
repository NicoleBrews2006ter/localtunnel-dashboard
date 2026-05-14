import { TunnelManager, TunnelConfig } from './TunnelManager';

// Mock localtunnel
const mockClose = jest.fn();
const mockOn = jest.fn();
const mockTunnel = { url: 'https://test-abc.loca.lt', close: mockClose, on: mockOn };

jest.mock('localtunnel', () => jest.fn().mockResolvedValue(mockTunnel));

describe('TunnelManager', () => {
  let manager: TunnelManager;

  beforeEach(() => {
    manager = new TunnelManager();
    jest.clearAllMocks();
  });

  it('should open a tunnel and return a session with status open', async () => {
    const config: TunnelConfig = { id: 'app1', port: 3000 };
    const session = await manager.open(config);

    expect(session.id).toBe('app1');
    expect(session.port).toBe(3000);
    expect(session.url).toBe('https://test-abc.loca.lt');
    expect(session.status).toBe('open');
    expect(session.createdAt).toBeInstanceOf(Date);
  });

  it('should throw when opening a duplicate tunnel id', async () => {
    const config: TunnelConfig = { id: 'app1', port: 3000 };
    await manager.open(config);
    await expect(manager.open(config)).rejects.toThrow('already exists');
  });

  it('should list all open tunnels', async () => {
    await manager.open({ id: 'app1', port: 3000 });
    await manager.open({ id: 'app2', port: 4000 });
    const list = manager.list();
    expect(list).toHaveLength(2);
    expect(list.map((s) => s.id)).toEqual(expect.arrayContaining(['app1', 'app2']));
  });

  it('should close a tunnel and remove it from the list', async () => {
    await manager.open({ id: 'app1', port: 3000 });
    await manager.close('app1');
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(manager.list()).toHaveLength(0);
  });

  it('should throw when closing a non-existent tunnel', async () => {
    await expect(manager.close('nonexistent')).rejects.toThrow('not found');
  });

  it('should return undefined for a non-existent tunnel get', () => {
    expect(manager.get('ghost')).toBeUndefined();
  });

  it('should set status to error when localtunnel rejects', async () => {
    const lt = require('localtunnel');
    lt.mockRejectedValueOnce(new Error('network failure'));
    const session = await manager.open({ id: 'fail1', port: 9999 });
    expect(session.status).toBe('error');
    expect(session.error).toBe('network failure');
  });
});
