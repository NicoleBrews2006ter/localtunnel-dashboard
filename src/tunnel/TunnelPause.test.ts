import {
  createPauseMap,
  pauseTunnel,
  resumeTunnel,
  getPauseState,
  isPaused,
  deletePauseEntry,
  listPausedTunnels,
} from "./TunnelPause";

describe("TunnelPause", () => {
  it("creates an empty pause map", () => {
    const map = createPauseMap();
    expect(map.size).toBe(0);
  });

  it("pauses a tunnel and records pausedAt", () => {
    const map = createPauseMap();
    const entry = pauseTunnel(map, "t1");
    expect(entry.state).toBe("paused");
    expect(entry.pausedAt).toBeInstanceOf(Date);
    expect(entry.resumedAt).toBeUndefined();
  });

  it("pausing an already-paused tunnel is idempotent", () => {
    const map = createPauseMap();
    const first = pauseTunnel(map, "t1");
    const second = pauseTunnel(map, "t1");
    expect(second).toBe(first);
  });

  it("resumes a paused tunnel and records resumedAt", () => {
    const map = createPauseMap();
    pauseTunnel(map, "t1");
    const entry = resumeTunnel(map, "t1");
    expect(entry.state).toBe("active");
    expect(entry.resumedAt).toBeInstanceOf(Date);
  });

  it("resuming an already-active tunnel is idempotent", () => {
    const map = createPauseMap();
    const first = resumeTunnel(map, "t1");
    const second = resumeTunnel(map, "t1");
    expect(second).toBe(first);
  });

  it("getPauseState returns active for unknown tunnel", () => {
    const map = createPauseMap();
    expect(getPauseState(map, "unknown")).toBe("active");
  });

  it("isPaused returns true only when paused", () => {
    const map = createPauseMap();
    expect(isPaused(map, "t1")).toBe(false);
    pauseTunnel(map, "t1");
    expect(isPaused(map, "t1")).toBe(true);
    resumeTunnel(map, "t1");
    expect(isPaused(map, "t1")).toBe(false);
  });

  it("deletePauseEntry removes the entry", () => {
    const map = createPauseMap();
    pauseTunnel(map, "t1");
    expect(deletePauseEntry(map, "t1")).toBe(true);
    expect(map.has("t1")).toBe(false);
  });

  it("listPausedTunnels returns only paused entries", () => {
    const map = createPauseMap();
    pauseTunnel(map, "t1");
    pauseTunnel(map, "t2");
    resumeTunnel(map, "t2");
    const paused = listPausedTunnels(map);
    expect(paused).toHaveLength(1);
    expect(paused[0].tunnelId).toBe("t1");
  });
});
