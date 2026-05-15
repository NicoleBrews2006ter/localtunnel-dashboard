import { Router, Request, Response } from "express";
import {
  createPauseMap,
  pauseTunnel,
  resumeTunnel,
  getPauseState,
  listPausedTunnels,
  deletePauseEntry,
  PauseMap,
} from "../tunnel/TunnelPause";

let pauseStore: PauseMap = createPauseMap();

export function resetPauseStore(): void {
  pauseStore = createPauseMap();
}

export function createPauseRouter(): Router {
  const router = Router();

  router.get("/", (_req: Request, res: Response) => {
    const paused = listPausedTunnels(pauseStore);
    res.json(paused);
  });

  router.get("/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const state = getPauseState(pauseStore, id);
    res.json({ tunnelId: id, state });
  });

  router.post("/:id/pause", (req: Request, res: Response) => {
    const { id } = req.params;
    const entry = pauseTunnel(pauseStore, id);
    res.status(200).json(entry);
  });

  router.post("/:id/resume", (req: Request, res: Response) => {
    const { id } = req.params;
    const entry = resumeTunnel(pauseStore, id);
    res.status(200).json(entry);
  });

  router.delete("/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const removed = deletePauseEntry(pauseStore, id);
    if (!removed) {
      res.status(404).json({ error: "Tunnel pause entry not found" });
      return;
    }
    res.status(204).send();
  });

  return router;
}
