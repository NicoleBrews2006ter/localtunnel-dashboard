import { EventEmitter } from "events";

export type LifecycleState =
  | "idle"
  | "starting"
  | "connected"
  | "reconnecting"
  | "stopping"
  | "stopped"
  | "error";

export interface LifecycleTransition {
  from: LifecycleState;
  to: LifecycleState;
  timestamp: Date;
}

const VALID_TRANSITIONS: Record<LifecycleState, LifecycleState[]> = {
  idle: ["starting"],
  starting: ["connected", "error", "stopping"],
  connected: ["reconnecting", "stopping", "error"],
  reconnecting: ["connected", "stopping", "error"],
  stopping: ["stopped"],
  stopped: ["starting"],
  error: ["starting", "stopped"],
};

export class TunnelLifecycle extends EventEmitter {
  private state: LifecycleState = "idle";
  private history: LifecycleTransition[] = [];

  getState(): LifecycleState {
    return this.state;
  }

  getHistory(): LifecycleTransition[] {
    return [...this.history];
  }

  canTransition(to: LifecycleState): boolean {
    return VALID_TRANSITIONS[this.state]?.includes(to) ?? false;
  }

  transition(to: LifecycleState): boolean {
    if (!this.canTransition(to)) {
      return false;
    }

    const transition: LifecycleTransition = {
      from: this.state,
      to,
      timestamp: new Date(),
    };

    this.history.push(transition);
    this.state = to;
    this.emit("transition", transition);
    this.emit(to);
    return true;
  }

  reset(): void {
    this.state = "idle";
    this.history = [];
    this.emit("reset");
  }
}
