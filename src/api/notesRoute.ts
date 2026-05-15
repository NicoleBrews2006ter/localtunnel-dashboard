import { Router, Request, Response } from "express";
import {
  TunnelNoteMap,
  setNote,
  getNote,
  deleteNote,
  listNotes,
} from "../tunnel/TunnelNote";

export function createNotesRouter(noteMap: TunnelNoteMap): Router {
  const router = Router();

  // GET /notes — list all notes
  router.get("/", (_req: Request, res: Response) => {
    res.json(listNotes(noteMap));
  });

  // GET /notes/:tunnelId
  router.get("/:tunnelId", (req: Request, res: Response) => {
    const note = getNote(noteMap, req.params.tunnelId);
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    res.json(note);
  });

  // PUT /notes/:tunnelId  { text: string }
  router.put("/:tunnelId", (req: Request, res: Response) => {
    const { text } = req.body as { text?: string };
    if (typeof text !== "string" || text.trim() === "") {
      res.status(400).json({ error: "text is required" });
      return;
    }
    const note = setNote(noteMap, req.params.tunnelId, text.trim());
    res.json(note);
  });

  // DELETE /notes/:tunnelId
  router.delete("/:tunnelId", (req: Request, res: Response) => {
    const removed = deleteNote(noteMap, req.params.tunnelId);
    if (!removed) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    res.status(204).send();
  });

  return router;
}
