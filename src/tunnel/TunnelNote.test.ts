import {
  TunnelNoteMap,
  createTunnelNote,
  updateTunnelNote,
  setNote,
  getNote,
  deleteNote,
  listNotes,
} from "./TunnelNote";

function makeMap(): TunnelNoteMap {
  return new Map();
}

describe("createTunnelNote", () => {
  it("creates a note with correct fields", () => {
    const note = createTunnelNote("t1", "hello");
    expect(note.tunnelId).toBe("t1");
    expect(note.text).toBe("hello");
    expect(note.createdAt).toBeInstanceOf(Date);
    expect(note.updatedAt).toBeInstanceOf(Date);
  });
});

describe("updateTunnelNote", () => {
  it("updates text and updatedAt, preserves createdAt", () => {
    const note = createTunnelNote("t1", "original");
    const updated = updateTunnelNote(note, "changed");
    expect(updated.text).toBe("changed");
    expect(updated.createdAt).toEqual(note.createdAt);
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      note.updatedAt.getTime()
    );
  });
});

describe("setNote", () => {
  it("creates a new note when none exists", () => {
    const map = makeMap();
    const note = setNote(map, "t1", "first");
    expect(note.text).toBe("first");
    expect(map.size).toBe(1);
  });

  it("updates an existing note", () => {
    const map = makeMap();
    setNote(map, "t1", "first");
    const updated = setNote(map, "t1", "second");
    expect(updated.text).toBe("second");
    expect(map.size).toBe(1);
  });
});

describe("getNote", () => {
  it("returns undefined for missing tunnel", () => {
    expect(getNote(makeMap(), "missing")).toBeUndefined();
  });

  it("returns the note when present", () => {
    const map = makeMap();
    setNote(map, "t1", "hi");
    expect(getNote(map, "t1")?.text).toBe("hi");
  });
});

describe("deleteNote", () => {
  it("returns false when note does not exist", () => {
    expect(deleteNote(makeMap(), "t1")).toBe(false);
  });

  it("removes an existing note", () => {
    const map = makeMap();
    setNote(map, "t1", "bye");
    expect(deleteNote(map, "t1")).toBe(true);
    expect(map.size).toBe(0);
  });
});

describe("listNotes", () => {
  it("returns all notes", () => {
    const map = makeMap();
    setNote(map, "t1", "a");
    setNote(map, "t2", "b");
    const notes = listNotes(map);
    expect(notes).toHaveLength(2);
    expect(notes.map((n) => n.tunnelId).sort()).toEqual(["t1", "t2"]);
  });
});
