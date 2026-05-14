import { Router, Request, Response } from 'express';
import {
  createTunnelGroup,
  addTunnelToGroup,
  removeTunnelFromGroup,
  deleteGroup,
  getGroup,
  listGroups,
} from '../tunnel/TunnelGroup';

export function createGroupsRouter(): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.json(listGroups());
  });

  router.post('/', (req: Request, res: Response) => {
    const { name, color, tunnelIds } = req.body ?? {};
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name is required' });
    }
    const group = createTunnelGroup(name, { color, tunnelIds });
    return res.status(201).json(group);
  });

  router.get('/:groupId', (req: Request, res: Response) => {
    const group = getGroup(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'group not found' });
    return res.json(group);
  });

  router.post('/:groupId/tunnels', (req: Request, res: Response) => {
    const { tunnelId } = req.body ?? {};
    if (!tunnelId) return res.status(400).json({ error: 'tunnelId is required' });
    const ok = addTunnelToGroup(req.params.groupId, tunnelId);
    if (!ok) return res.status(404).json({ error: 'group not found' });
    return res.json(getGroup(req.params.groupId));
  });

  router.delete('/:groupId/tunnels/:tunnelId', (req: Request, res: Response) => {
    const ok = removeTunnelFromGroup(req.params.groupId, req.params.tunnelId);
    if (!ok) return res.status(404).json({ error: 'group not found' });
    return res.json(getGroup(req.params.groupId));
  });

  router.delete('/:groupId', (req: Request, res: Response) => {
    const ok = deleteGroup(req.params.groupId);
    if (!ok) return res.status(404).json({ error: 'group not found' });
    return res.status(204).send();
  });

  return router;
}
