import { Router, Request, Response } from 'express';
import { TunnelStore } from '../tunnel/TunnelStore';

export function createStatusRouter(store: TunnelStore): Router {
  const router = Router();

  /**
   * GET /api/status
   * Returns overall dashboard health and aggregate tunnel statistics.
   */
  router.get('/', (_req: Request, res: Response) => {
    const tunnels = store.getAll();

    const total = tunnels.length;
    const online = tunnels.filter((t) => t.status === 'online').length;
    const offline = tunnels.filter((t) => t.status === 'offline').length;
    const errored = tunnels.filter((t) => t.status === 'error').length;

    res.json({
      ok: true,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      tunnels: {
        total,
        online,
        offline,
        errored,
      },
    });
  });

  /**
   * GET /api/status/:id
   * Returns the status of a single tunnel by id.
   */
  router.get('/:id', (req: Request, res: Response) => {
    const tunnel = store.get(req.params.id);

    if (!tunnel) {
      res.status(404).json({ ok: false, message: `Tunnel '${req.params.id}' not found.` });
      return;
    }

    res.json({
      ok: true,
      tunnel: {
        id: tunnel.id,
        url: tunnel.url,
        status: tunnel.status,
        createdAt: tunnel.createdAt,
      },
    });
  });

  return router;
}
