import express, { Express } from 'express';
import { TunnelStore } from '../tunnel/TunnelStore';
import { TunnelManager } from '../tunnel/TunnelManager';
import { TunnelLogger } from '../tunnel/TunnelLogger';
import { createTunnelsRouter } from './tunnelsRoute';
import { createStatusRouter } from './statusRoute';
import { createLogsRouter } from './logsRoute';

export interface AppDependencies {
  store: TunnelStore;
  manager: TunnelManager;
  logger: TunnelLogger;
}

export function createApp(deps: AppDependencies): Express {
  const { store, manager, logger } = deps;
  const app = express();

  app.use(express.json());

  app.use('/api/tunnels', createTunnelsRouter(store, manager));
  app.use('/api/status', createStatusRouter(store));
  app.use('/api/logs', createLogsRouter(logger));

  app.get('/healthz', (_req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
  });

  return app;
}
