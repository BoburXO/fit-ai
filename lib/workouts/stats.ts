import type { WorkoutRecord } from "../../types/domain";
import { addDays, dayKey, daysBetweenKeys } from "./dates";

export function totals(workouts: readonly WorkoutRecord[]) {
  const done = workouts.filter((w) => w.completed);
  return {
    workouts: done.length,
    minutes: Math.round(done.reduce((s, w) => s + w.durationSec, 0) / 60),
    reps: done.reduce((s, w) => s + w.reps, 0),
    sample: done.filter((w) => w.source === "demo").length,
  };
}

/** Consecutive active days ending today (or yesterday, so the streak is not lost until the day is over). */
export function currentStreak(workouts: readonly WorkoutRecord[], nowIso: string): number {
  const days = new Set(workouts.filter((w) => w.completed).map((w) => dayKey(w.startedAt)));
  const today = dayKey(nowIso);
  let cursor = days.has(today) ? today : dayKey(addDays(nowIso, -1));
  let n = 0;
  while (days.has(cursor)) {
    n += 1;
    cursor = dayKey(addDays(cursor + "T12:00:00Z", -1), 0);
  }
  return n;
}

export function minutesOnDay(workouts: readonly WorkoutRecord[], key: string): number {
  return Math.round(
    workouts.filter((w) => w.completed && dayKey(w.startedAt) === key).reduce((s, w) => s + w.durationSec, 0) / 60,
  );
}

export interface DayPoint {
  key: string;
  label: string;
  minutes: number;
  workouts: number;
}

const DOW = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];

export function lastNDays(workouts: readonly WorkoutRecord[], nowIso: string, n: number): DayPoint[] {
  const out: DayPoint[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const key = dayKey(addDays(nowIso, -i));
    const dow = new Date(key + "T12:00:00Z").getUTCDay();
    const day = workouts.filter((w) => w.completed && dayKey(w.startedAt) === key);
    out.push({
      key,
      label: n <= 7 ? DOW[dow]! : key.slice(8),
      minutes: minutesOnDay(workouts, key),
      workouts: day.length,
    });
  }
  return out;
}

/** Personal records are derived from camera-measured workouts only. */
export function personalRecords(workouts: readonly WorkoutRecord[]) {
  const real = workouts.filter((w) => w.source === "camera" && w.completed);
  const best = (id: WorkoutRecord["exerciseId"], f: (w: WorkoutRecord) => number) =>
    real.filter((w) => w.exerciseId === id).reduce((m, w) => Math.max(m, f(w)), 0);
  return { squatReps: best("squat", (w) => w.reps), pushupReps: best("pushup", (w) => w.reps), plankSec: best("plank", (w) => w.holdSec) };
}

export { daysBetweenKeys };
