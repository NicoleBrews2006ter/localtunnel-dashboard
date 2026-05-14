export interface TunnelOptions {
  subdomain?: string;
  host?: string;
  port: number;
  localHost?: string;
  localHttps?: boolean;
  localCert?: string;
  localKey?: string;
  localCa?: string;
  allowInvalidCert?: boolean;
}

export interface TunnelConfig {
  id: string;
  name: string;
  options: TunnelOptions;
  createdAt: Date;
}

const DEFAULT_HOST = 'https://localtunnel.me';
const DEFAULT_LOCAL_HOST = 'localhost';

export function createTunnelConfig(
  id: string,
  name: string,
  options: TunnelOptions
): TunnelConfig {
  if (!options.port || options.port < 1 || options.port > 65535) {
    throw new Error(`Invalid port: ${options.port}`);
  }

  if (name.trim().length === 0) {
    throw new Error('Tunnel name must not be empty');
  }

  return {
    id,
    name: name.trim(),
    options: {
      host: DEFAULT_HOST,
      localHost: DEFAULT_LOCAL_HOST,
      localHttps: false,
      allowInvalidCert: false,
      ...options,
    },
    createdAt: new Date(),
  };
}

export function serializeTunnelConfig(config: TunnelConfig): Record<string, unknown> {
  return {
    id: config.id,
    name: config.name,
    port: config.options.port,
    host: config.options.host,
    localHost: config.options.localHost,
    subdomain: config.options.subdomain ?? null,
    localHttps: config.options.localHttps,
    allowInvalidCert: config.options.allowInvalidCert,
    createdAt: config.createdAt.toISOString(),
  };
}
