import type { Challenge, WorkoutRecord } from "../../types/domain";
import { dayKey } from "../workouts/dates";

export type ChallengeStatus = "upcoming" | "active" | "closed";

export interface Progress {
  current: number;
  target: number;
  percent: number;
  /** True only when the defined rule is satisfied inside the challenge window. */
  completed: boolean;
}

export function challengeStatus(c: Challenge, nowIso: string): ChallengeStatus {
  if (c.closed || nowIso > c.endsAt) return "closed";
  if (nowIso < c.startsAt) return "upcoming";
  return "active";
}

/** Only real, completed, camera-measured workouts inside [max(start, joinedAt), end] count. */
export function eligibleWorkouts(c: Challenge, workouts: readonly WorkoutRecord[], joinedAt: string): WorkoutRecord[] {
  const from = joinedAt > c.startsAt ? joinedAt : c.startsAt;
  return workouts.filter(
    (w) =>
      w.completed &&
      w.source === "camera" &&
      w.startedAt >= from &&
      w.startedAt <= c.endsAt &&
      (!c.exerciseId || w.exerciseId === c.exerciseId),
  );
}

export function computeProgress(c: Challenge, workouts: readonly WorkoutRecord[], joinedAt: string, extraTeamCount = 0): Progress {
  const list = eligibleWorkouts(c, workouts, joinedAt);
  let current = 0;
  switch (c.metric) {
    case "workouts":
      current = list.length + (c.scope === "team" ? extraTeamCount : 0);
      break;
    case "reps":
      current = list.reduce((s, w) => s + w.reps, 0);
      break;
    case "active_days":
      current = new Set(list.map((w) => dayKey(w.startedAt))).size;
      break;
    case "minutes":
      current = Math.floor(list.reduce((s, w) => s + w.durationSec, 0) / 60);
      break;
  }
  const percent = Math.min(100, Math.round((current / c.target) * 100));
  return { current, target: c.target, percent, completed: current >= c.target };
}
