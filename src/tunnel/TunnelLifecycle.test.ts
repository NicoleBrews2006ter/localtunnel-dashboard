import { TunnelLifecycle, LifecycleTransition } from "./TunnelLifecycle";

describe("TunnelLifecycle", () => {
  let lifecycle: TunnelLifecycle;

  beforeEach(() => {
    lifecycle = new TunnelLifecycle();
  });

  it("starts in idle state", () => {
    expect(lifecycle.getState()).toBe("idle");
  });

  it("transitions from idle to starting", () => {
    const result = lifecycle.transition("starting");
    expect(result).toBe(true);
    expect(lifecycle.getState()).toBe("starting");
  });

  it("returns false for invalid transition", () => {
    const result = lifecycle.transition("connected");
    expect(result).toBe(false);
    expect(lifecycle.getState()).toBe("idle");
  });

  it("follows a full happy path", () => {
    lifecycle.transition("starting");
    lifecycle.transition("connected");
    lifecycle.transition("stopping");
    lifecycle.transition("stopped");
    expect(lifecycle.getState()).toBe("stopped");
  });

  it("records history of transitions", () => {
    lifecycle.transition("starting");
    lifecycle.transition("connected");
    const history = lifecycle.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe("idle");
    expect(history[0].to).toBe("starting");
    expect(history[1].from).toBe("starting");
    expect(history[1].to).toBe("connected");
  });

  it("emits transition event with details", () => {
    const handler = jest.fn();
    lifecycle.on("transition", handler);
    lifecycle.transition("starting");
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining<Partial<LifecycleTransition>>({
        from: "idle",
        to: "starting",
      })
    );
  });

  it("emits named state event on transition", () => {
    const handler = jest.fn();
    lifecycle.on("starting", handler);
    lifecycle.transition("starting");
    expect(handler).toHaveBeenCalled();
  });

  it("canTransition returns correct boolean", () => {
    expect(lifecycle.canTransition("starting")).toBe(true);
    expect(lifecycle.canTransition("connected")).toBe(false);
  });

  it("reset returns to idle and clears history", () => {
    lifecycle.transition("starting");
    lifecycle.transition("connected");
    lifecycle.reset();
    expect(lifecycle.getState()).toBe("idle");
    expect(lifecycle.getHistory()).toHaveLength(0);
  });

  it("emits reset event on reset", () => {
    const handler = jest.fn();
    lifecycle.on("reset", handler);
    lifecycle.reset();
    expect(handler).toHaveBeenCalled();
  });
});
