import { Router, Request, Response } from 'express';
import { tunnelStore } from '../tunnel/TunnelStore';

const router = Router();

/**
 * GET /api/tunnels
 * Returns all current tunnel entries.
 */
router.get('/', (_req: Request, res: Response) => {
  const tunnels = tunnelStore.getAll();
  res.json({ tunnels });
});

/**
 * GET /api/tunnels/:id
 * Returns a single tunnel entry by ID.
 */
router.get('/:id', (req: Request, res: Response) => {
  const entry = tunnelStore.get(req.params.id);
  if (!entry) {
    return res.status(404).json({ error: `Tunnel '${req.params.id}' not found` });
  }
  res.json({ tunnel: entry });
});

/**
 * DELETE /api/tunnels/:id
 * Removes a tunnel entry from the store.
 */
router.delete('/:id', (req: Request, res: Response) => {
  const removed = tunnelStore.remove(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: `Tunnel '${req.params.id}' not found` });
  }
  res.status(204).send();
});

export default router;
