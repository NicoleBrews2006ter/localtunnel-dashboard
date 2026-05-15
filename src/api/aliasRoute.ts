import { Router, Request, Response } from "express";
import {
  createAliasMap,
  setAlias,
  getAlias,
  deleteAlias,
  resolveByAlias,
  listAliases,
  AliasMap,
} from "../tunnel/TunnelAlias";

let store: AliasMap = createAliasMap();

/** Exposed for testing — resets internal state. */
export function resetAliasStore(): void {
  store = createAliasMap();
}

export function createAliasRouter(): Router {
  const router = Router();

  // GET /aliases — list all
  router.get("/", (_req: Request, res: Response) => {
    res.json(listAliases(store));
  });

  // GET /aliases/:tunnelId
  router.get("/:tunnelId", (req: Request, res: Response) => {
    const record = getAlias(store, req.params.tunnelId);
    if (!record) return res.status(404).json({ error: "Alias not found" });
    res.json(record);
  });

  // GET /aliases/resolve/:alias
  router.get("/resolve/:alias", (req: Request, res: Response) => {
    const record = resolveByAlias(store, req.params.alias);
    if (!record) return res.status(404).json({ error: "Alias not found" });
    res.json(record);
  });

  // PUT /aliases/:tunnelId
  router.put("/:tunnelId", (req: Request, res: Response) => {
    const { alias } = req.body as { alias?: string };
    if (typeof alias !== "string") {
      return res.status(400).json({ error: "alias (string) is required" });
    }
    try {
      const record = setAlias(store, req.params.tunnelId, alias);
      res.status(200).json(record);
    } catch (err: any) {
      res.status(409).json({ error: err.message });
    }
  });

  // DELETE /aliases/:tunnelId
  router.delete("/:tunnelId", (req: Request, res: Response) => {
    const deleted = deleteAlias(store, req.params.tunnelId);
    if (!deleted) return res.status(404).json({ error: "Alias not found" });
    res.status(204).send();
  });

  return router;
}
