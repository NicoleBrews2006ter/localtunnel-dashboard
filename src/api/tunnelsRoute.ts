import { Router, Request, Response } from 'express';
import { TunnelStore } from '../tunnel/TunnelStore';
import { TunnelManager } from '../tunnel/TunnelManager';

export function createTunnelsRouter(
  store: TunnelStore,
  manager: TunnelManager
): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    const tunnels = store.getAll();
    res.json({ tunnels });
  });

  router.get('/:id', (req: Request, res: Response) => {
    const tunnel = store.get(req.params.id);
    if (!tunnel) {
      return res.status(404).json({ error: 'Tunnel not found' });
    }
    res.json({ tunnel });
  });

  router.post('/', async (req: Request, res: Response) => {
    const { subdomain, port } = req.body;
    if (!port) {
      return res.status(400).json({ error: 'port is required' });
    }
    try {
      const tunnel = await manager.open({ subdomain, port });
      res.status(201).json({ tunnel });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    const exists = store.get(req.params.id);
    if (!exists) {
      return res.status(404).json({ error: 'Tunnel not found' });
    }
    await manager.close(req.params.id);
    res.status(204).send();
  });

  return router;
}
