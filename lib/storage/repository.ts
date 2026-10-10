import { storedStateSchema } from "../validation/schemas";
import { createInitialState, type AppState } from "./state";

/** Storage abstraction: the UI talks to this interface; swap in a DB-backed one later. */
export interface StateRepository {
  load(): AppState;
  save(state: AppState): void;
  reset(): AppState;
}

const KEY = "fitai.demo.state.v1";

/** Browser-only. Holds demo data and preferences; never secrets or credentials. */
export class LocalStorageRepository implements StateRepository {
  load(): AppState {
    if (typeof window === "undefined") return createInitialState(new Date().toISOString());
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = storedStateSchema.safeParse(JSON.parse(raw));
        if (parsed.success) return parsed.data as AppState;
      }
    } catch {
      /* corrupted or blocked storage: fall through to a fresh state */
    }
    const fresh = createInitialState(new Date().toISOString());
    this.save(fresh);
    return fresh;
  }
  save(state: AppState): void {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota or privacy mode: app keeps working in memory */
    }
  }
  reset(): AppState {
    const fresh = createInitialState(new Date().toISOString());
    this.save(fresh);
    return fresh;
  }
}
