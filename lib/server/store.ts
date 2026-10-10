import { createInitialState, type AppState } from "@/lib/storage/state";

/** In-memory demo store (resets when the server restarts). Real deployment: Prisma repository. */
const g = globalThis as unknown as { __fitaiStore?: Map<string, AppState> };
const store = (g.__fitaiStore ??= new Map<string, AppState>());

export function getState(userId: string): AppState {
  let s = store.get(userId);
  if (!s) {
    s = { ...createInitialState(new Date().toISOString()), userId, workouts: [], hasSampleData: false };
    store.set(userId, s);
  }
  return s;
}

export function putState(s: AppState) {
  store.set(s.userId, s);
}
