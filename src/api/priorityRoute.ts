import { Router, Request, Response } from 'express';
import {
  setPriority,
  getPriority,
  deletePriority,
  listPriorities,
  sortByPriority,
  TunnelPriority,
  PriorityLevel,
} from '../tunnel/TunnelPriority';

const VALID_LEVELS: PriorityLevel[] = ['low', 'normal', 'high', 'critical'];

const priorityMap = new Map<string, TunnelPriority>();

export function createPriorityRouter(): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.json(listPriorities(priorityMap));
  });

  router.get('/sorted', (req: Request, res: Response) => {
    const ids = req.query.ids;
    if (!ids || typeof ids !== 'string') {
      return res.status(400).json({ error: 'ids query param required (comma-separated)' });
    }
    const tunnelIds = ids.split(',').map((s) => s.trim()).filter(Boolean);
    res.json(sortByPriority(tunnelIds, priorityMap));
  });

  router.get('/:tunnelId', (req: Request, res: Response) => {
    const entry = getPriority(priorityMap, req.params.tunnelId);
    if (!entry) return res.status(404).json({ error: 'Priority not found' });
    res.json(entry);
  });

  router.put('/:tunnelId', (req: Request, res: Response) => {
    const { level } = req.body as { level?: PriorityLevel };
    if (!level || !VALID_LEVELS.includes(level)) {
      return res.status(400).json({ error: `level must be one of: ${VALID_LEVELS.join(', ')}` });
    }
    const entry = setPriority(priorityMap, req.params.tunnelId, level);
    res.json(entry);
  });

  router.delete('/:tunnelId', (req: Request, res: Response) => {
    const deleted = deletePriority(priorityMap, req.params.tunnelId);
    if (!deleted) return res.status(404).json({ error: 'Priority not found' });
    res.status(204).send();
  });

  return router;
}
