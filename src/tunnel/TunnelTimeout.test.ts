import { TunnelTimeout } from "./TunnelTimeout";

function flushTimers() {
  return new Promise<void>((resolve) => setImmediate(resolve));
}

describe("TunnelTimeout", () => {
  let tt: TunnelTimeout;

  beforeEach(() => {
    jest.useFakeTimers();
    tt = new TunnelTimeout(5_000);
  });

  afterEach(() => {
    tt.cancelAll();
    jest.useRealTimers();
  });

  it("emits timeout after the specified delay", () => {
    const handler = jest.fn();
    tt.on("timeout", handler);
    tt.start("t1", 1_000);
    jest.advanceTimersByTime(999);
    expect(handler).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(handler).toHaveBeenCalledWith("t1");
  });

  it("uses default timeout when none provided", () => {
    const handler = jest.fn();
    tt.on("timeout", handler);
    tt.start("t2");
    jest.advanceTimersByTime(4_999);
    expect(handler).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(handler).toHaveBeenCalledWith("t2");
  });

  it("cancel prevents timeout from firing", () => {
    const handler = jest.fn();
    tt.on("timeout", handler);
    tt.start("t3", 1_000);
    expect(tt.cancel("t3")).toBe(true);
    jest.advanceTimersByTime(2_000);
    expect(handler).not.toHaveBeenCalled();
  });

  it("cancel returns false for unknown tunnel", () => {
    expect(tt.cancel("unknown")).toBe(false);
  });

  it("reset restarts the timer", () => {
    const handler = jest.fn();
    tt.on("timeout", handler);
    tt.start("t4", 1_000);
    jest.advanceTimersByTime(800);
    expect(tt.reset("t4")).toBe(true);
    jest.advanceTimersByTime(800);
    expect(handler).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("reset returns false for unknown tunnel", () => {
    expect(tt.reset("missing")).toBe(false);
  });

  it("isActive reflects current state", () => {
    tt.start("t5", 1_000);
    expect(tt.isActive("t5")).toBe(true);
    tt.cancel("t5");
    expect(tt.isActive("t5")).toBe(false);
  });

  it("activeIds returns all active tunnel ids", () => {
    tt.start("a", 1_000);
    tt.start("b", 1_000);
    expect(tt.activeIds().sort()).toEqual(["a", "b"]);
  });

  it("cancelAll clears all timers", () => {
    const handler = jest.fn();
    tt.on("timeout", handler);
    tt.start("x", 500);
    tt.start("y", 500);
    tt.cancelAll();
    jest.advanceTimersByTime(1_000);
    expect(handler).not.toHaveBeenCalled();
    expect(tt.activeIds()).toHaveLength(0);
  });

  it("getRemainingMs returns null for unknown tunnel", () => {
    expect(tt.getRemainingMs("nope")).toBeNull();
  });

  it("removes entry from active map after firing", () => {
    tt.start("t6", 500);
    jest.advanceTimersByTime(500);
    expect(tt.isActive("t6")).toBe(false);
  });
});
