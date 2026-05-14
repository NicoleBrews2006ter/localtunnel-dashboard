import { Router, Request, Response } from 'express';
import { TunnelHealth } from '../tunnel/TunnelHealth';

export function createHealthRouter(tunnelHealth: TunnelHealth): Router {
  const router = Router();

  // GET /health — overall health summary
  router.get('/', (_req: Request, res: Response) => {
    const records = tunnelHealth.getAllHealth();
    const total = records.length;
    const healthy = records.filter((r) => r.status === 'healthy').length;
    const degraded = records.filter((r) => r.status === 'degraded').length;
    const down = records.filter((r) => r.status === 'down').length;

    res.json({
      total,
      healthy,
      degraded,
      down,
      tunnels: records,
    });
  });

  // GET /health/:id — health for a specific tunnel
  router.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const record = tunnelHealth.getHealth(id);
    if (!record) {
      return res.status(404).json({ error: `No health record for tunnel '${id}'` });
    }
    return res.json(record);
  });

  return router;
}
