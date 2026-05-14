import { createTunnelConfig, serializeTunnelConfig, TunnelOptions } from './TunnelConfig';

describe('createTunnelConfig', () => {
  const baseOptions: TunnelOptions = { port: 3000 };

  it('creates a config with required fields', () => {
    const config = createTunnelConfig('abc123', 'my-tunnel', baseOptions);
    expect(config.id).toBe('abc123');
    expect(config.name).toBe('my-tunnel');
    expect(config.options.port).toBe(3000);
    expect(config.createdAt).toBeInstanceOf(Date);
  });

  it('applies default host and localHost', () => {
    const config = createTunnelConfig('id1', 'test', baseOptions);
    expect(config.options.host).toBe('https://localtunnel.me');
    expect(config.options.localHost).toBe('localhost');
  });

  it('allows overriding defaults', () => {
    const config = createTunnelConfig('id2', 'custom', {
      port: 8080,
      host: 'https://custom.host',
      localHost: '127.0.0.1',
    });
    expect(config.options.host).toBe('https://custom.host');
    expect(config.options.localHost).toBe('127.0.0.1');
  });

  it('trims whitespace from name', () => {
    const config = createTunnelConfig('id3', '  spaced  ', baseOptions);
    expect(config.name).toBe('spaced');
  });

  it('throws on invalid port (0)', () => {
    expect(() => createTunnelConfig('id4', 'bad', { port: 0 })).toThrow('Invalid port');
  });

  it('throws on invalid port (>65535)', () => {
    expect(() => createTunnelConfig('id5', 'bad', { port: 99999 })).toThrow('Invalid port');
  });

  it('throws on empty name', () => {
    expect(() => createTunnelConfig('id6', '   ', baseOptions)).toThrow('Tunnel name must not be empty');
  });
});

describe('serializeTunnelConfig', () => {
  it('serializes config to plain object', () => {
    const config = createTunnelConfig('xyz', 'serialized', { port: 4000, subdomain: 'my-sub' });
    const result = serializeTunnelConfig(config);
    expect(result.id).toBe('xyz');
    expect(result.name).toBe('serialized');
    expect(result.port).toBe(4000);
    expect(result.subdomain).toBe('my-sub');
    expect(typeof result.createdAt).toBe('string');
  });

  it('sets subdomain to null when not provided', () => {
    const config = createTunnelConfig('id7', 'no-sub', { port: 5000 });
    const result = serializeTunnelConfig(config);
    expect(result.subdomain).toBeNull();
  });
});
