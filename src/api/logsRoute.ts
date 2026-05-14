import { Router, Request, Response } from 'express';
import { TunnelLogger } from '../tunnel/TunnelLogger';

export function createLogsRouter(logger: TunnelLogger): Router {
  const router = Router();

  /**
   * GET /logs
   * Returns all logs across all tunnels, sorted by timestamp.
   */
  router.get('/', (_req: Request, res: Response) => {
    const logs = logger.getAllLogs();
    res.json({ logs });
  });

  /**
   * GET /logs/:tunnelId
   * Returns logs for a specific tunnel.
   */
  router.get('/:tunnelId', (req: Request, res: Response) => {
    const { tunnelId } = req.params;
    const logs = logger.getLogsForTunnel(tunnelId);
    res.json({ tunnelId, logs });
  });

  /**
   * DELETE /logs/:tunnelId
   * Clears logs for a specific tunnel.
   */
  router.delete('/:tunnelId', (req: Request, res: Response) => {
    const { tunnelId } = req.params;
    logger.clearLogsForTunnel(tunnelId);
    res.json({ success: true, message: `Logs cleared for tunnel ${tunnelId}` });
  });

  return router;
}
