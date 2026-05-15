/**
 * TunnelNote — attach freeform notes/annotations to tunnel sessions.
 */

export interface TunnelNote {
  tunnelId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TunnelNoteMap = Map<string, TunnelNote>;

export function createTunnelNote(tunnelId: string, text: string): TunnelNote {
  const now = new Date();
  return { tunnelId, text, createdAt: now, updatedAt: now };
}

export function updateTunnelNote(
  existing: TunnelNote,
  newText: string
): TunnelNote {
  return { ...existing, text: newText, updatedAt: new Date() };
}

export function setNote(
  map: TunnelNoteMap,
  tunnelId: string,
  text: string
): TunnelNote {
  const existing = map.get(tunnelId);
  const note = existing
    ? updateTunnelNote(existing, text)
    : createTunnelNote(tunnelId, text);
  map.set(tunnelId, note);
  return note;
}

export function getNote(
  map: TunnelNoteMap,
  tunnelId: string
): TunnelNote | undefined {
  return map.get(tunnelId);
}

export function deleteNote(map: TunnelNoteMap, tunnelId: string): boolean {
  return map.delete(tunnelId);
}

export function listNotes(map: TunnelNoteMap): TunnelNote[] {
  return Array.from(map.values());
}
