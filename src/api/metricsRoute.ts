import { Router, Request, Response } from 'express';
import { TunnelStore } from '../tunnel/TunnelStore';
import { TunnelMetrics } from '../tunnel/TunnelMetrics';

const metricsRegistry = new Map<string, TunnelMetrics>();

export function getOrCreateMetrics(tunnelId: string): TunnelMetrics {
  if (!metricsRegistry.has(tunnelId)) {
    metricsRegistry.set(tunnelId, new TunnelMetrics(tunnelId));
  }
  return metricsRegistry.get(tunnelId)!;
}

export function clearMetricsRegistry(): void {
  metricsRegistry.clear();
}

export function createMetricsRouter(store: TunnelStore): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    const tunnels = store.getAll();
    const snapshots = tunnels.map((t) => {
      const m = getOrCreateMetrics(t.id);
      return m.snapshot();
    });
    res.json(snapshots);
  });

  router.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const tunnel = store.get(id);
    if (!tunnel) {
      res.status(404).json({ error: 'Tunnel not found' });
      return;
    }
    const m = getOrCreateMetrics(id);
    res.json(m.snapshot());
  });

  router.post('/:id/reset', (req: Request, res: Response) => {
    const { id } = req.params;
    const tunnel = store.get(id);
    if (!tunnel) {
      res.status(404).json({ error: 'Tunnel not found' });
      return;
    }
    const m = getOrCreateMetrics(id);
    m.reset();
    res.json({ success: true, tunnelId: id });
  });

  return router;
}
