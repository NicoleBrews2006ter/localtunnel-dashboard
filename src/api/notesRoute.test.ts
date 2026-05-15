import express from "express";
import request from "supertest";
import { createNotesRouter } from "./notesRoute";
import { TunnelNoteMap, setNote } from "../tunnel/TunnelNote";

function buildApp(noteMap: TunnelNoteMap) {
  const app = express();
  app.use(express.json());
  app.use("/notes", createNotesRouter(noteMap));
  return app;
}

describe("GET /notes", () => {
  it("returns empty array when no notes", async () => {
    const app = buildApp(new Map());
    const res = await request(app).get("/notes");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns all notes", async () => {
    const map: TunnelNoteMap = new Map();
    setNote(map, "t1", "hello");
    const app = buildApp(map);
    const res = await request(app).get("/notes");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].tunnelId).toBe("t1");
  });
});

describe("GET /notes/:tunnelId", () => {
  it("returns 404 when not found", async () => {
    const res = await request(buildApp(new Map())).get("/notes/missing");
    expect(res.status).toBe(404);
  });

  it("returns the note", async () => {
    const map: TunnelNoteMap = new Map();
    setNote(map, "t2", "world");
    const res = await request(buildApp(map)).get("/notes/t2");
    expect(res.status).toBe(200);
    expect(res.body.text).toBe("world");
  });
});

describe("PUT /notes/:tunnelId", () => {
  it("returns 400 when text is missing", async () => {
    const res = await request(buildApp(new Map()))
      .put("/notes/t1")
      .send({});
    expect(res.status).toBe(400);
  });

  it("creates a new note", async () => {
    const map: TunnelNoteMap = new Map();
    const res = await request(buildApp(map))
      .put("/notes/t1")
      .send({ text: "new note" });
    expect(res.status).toBe(200);
    expect(res.body.text).toBe("new note");
    expect(map.has("t1")).toBe(true);
  });

  it("updates an existing note", async () => {
    const map: TunnelNoteMap = new Map();
    setNote(map, "t1", "old");
    const res = await request(buildApp(map))
      .put("/notes/t1")
      .send({ text: "updated" });
    expect(res.status).toBe(200);
    expect(res.body.text).toBe("updated");
  });
});

describe("DELETE /notes/:tunnelId", () => {
  it("returns 404 when note does not exist", async () => {
    const res = await request(buildApp(new Map())).delete("/notes/ghost");
    expect(res.status).toBe(404);
  });

  it("deletes an existing note", async () => {
    const map: TunnelNoteMap = new Map();
    setNote(map, "t1", "bye");
    const res = await request(buildApp(map)).delete("/notes/t1");
    expect(res.status).toBe(204);
    expect(map.has("t1")).toBe(false);
  });
});
