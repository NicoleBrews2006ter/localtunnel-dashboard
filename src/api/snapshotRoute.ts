import { Router, Request, Response } from 'express';
import { TunnelStore } from '../tunnel/TunnelStore';
import { TunnelStatus } from '../tunnel/TunnelStatus';
import { TunnelHealth } from '../tunnel/TunnelHealth';
import { TunnelMetrics } from '../tunnel/TunnelMetrics';
import { captureTunnelSnapshot } from '../tunnel/TunnelSnapshot';

export interface SnapshotRouterDeps {
  store: TunnelStore;
  statusMap: Map<string, TunnelStatus>;
  healthMap: Map<string, TunnelHealth>;
  metricsMap: Map<string, TunnelMetrics>;
}

export function createSnapshotRouter(deps: SnapshotRouterDeps): Router {
  const router = Router();

  router.get('/snapshot', (_req: Request, res: Response) => {
    try {
      const snapshot = captureTunnelSnapshot(
        deps.store,
        deps.statusMap,
        deps.healthMap,
        deps.metricsMap
      );
      res.status(200).json(snapshot);
    } catch (err) {
      res.status(500).json({ error: 'Failed to capture snapshot' });
    }
  });

  return router;
}
