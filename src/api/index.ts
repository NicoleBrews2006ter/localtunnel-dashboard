import express, { Express } from 'express';
import { createTunnelsRouter } from './tunnelsRoute';
import { createStatusRouter } from './statusRoute';
import { createLogsRouter } from './logsRoute';
import { createHealthRouter } from './healthRoute';
import { createMetricsRouter } from './metricsRoute';
import { createSnapshotRouter } from './snapshotRoute';
import { createGroupsRouter } from './groupsRoute';
import { TunnelStore } from '../tunnel/TunnelStore';
import { TunnelLogger } from '../tunnel/TunnelLogger';
import { TunnelEventBus } from '../tunnel/TunnelEventBus';

export function createApp(
  store: TunnelStore,
  logger: TunnelLogger,
  bus: TunnelEventBus
): Express {
  const app = express();

  app.use(express.json());

  app.use('/api/tunnels', createTunnelsRouter(store));
  app.use('/api/status', createStatusRouter(store));
  app.use('/api/logs', createLogsRouter(logger));
  app.use('/api/health', createHealthRouter(store));
  app.use('/api/metrics', createMetricsRouter(store));
  app.use('/api/snapshot', createSnapshotRouter(store));
  app.use('/api/groups', createGroupsRouter());

  return app;
}
