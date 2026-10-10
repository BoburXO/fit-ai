import type { Challenge, LedgerEntry, WorkoutRecord } from "../../types/domain";
import { dayKey } from "../workouts/dates";
import { validateWorkout, type WorkoutInput } from "../workouts/validate";

/** Central, configurable scoring rules. Clients never send point values. */
export const SCORING_RULES = {
  workoutPoints: 20,
  dailyBonusPoints: 5,
  /** Only this many workouts per day can earn points (anti-farming). */
  maxScoredWorkoutsPerDay: 5,
} as const;

export interface AwardContext {
  userId: string;
  teamId: string | null;
  ledger: readonly LedgerEntry[];
  now: string;
}

export interface WorkoutAward {
  workout: WorkoutRecord;
  entries: LedgerEntry[];
  reason: "awarded" | "not_valid" | "daily_limit" | "duplicate";
}

const entry = (
  ctx: AwardContext,
  key: string,
  points: number,
  reason: LedgerEntry["reason"],
  refId: string,
): LedgerEntry => ({
  id: `led_${key}`,
  key,
  userId: ctx.userId,
  teamId: ctx.teamId,
  points,
  reason,
  refId,
  createdAt: ctx.now,
});

/**
 * Pure function: decides whether a finished workout is valid and which ledger entries it
 * produces. Duplicate protection: an entry whose key already exists in the ledger is skipped.
 * The persistent version must also enforce a UNIQUE(key) constraint inside a DB transaction.
 */
export function awardWorkout(
  ctx: AwardContext,
  input: WorkoutInput & { id: string; startedAt: string },
): WorkoutAward {
  const verdict = validateWorkout(input);
  const base: WorkoutRecord = {
    id: input.id,
    exerciseId: input.exerciseId,
    startedAt: input.startedAt,
    durationSec: Math.round(input.durationSec),
    reps: Math.round(input.reps),
    holdSec: Math.round(input.holdSec),
    source: input.source,
    completed: verdict.valid,
    points: 0,
  };
  if (!verdict.valid) return { workout: base, entries: [], reason: "not_valid" };

  const have = new Set(ctx.ledger.map((e) => e.key));
  const workoutKey = `workout:${input.id}`;
  if (have.has(workoutKey)) return { workout: base, entries: [], reason: "duplicate" };

  const day = dayKey(input.startedAt);
  const scoredToday = ctx.ledger.filter(
    (e) => e.userId === ctx.userId && e.reason === "workout" && dayKey(e.createdAt) === day,
  ).length;
  if (scoredToday >= SCORING_RULES.maxScoredWorkoutsPerDay) {
    return { workout: base, entries: [], reason: "daily_limit" };
  }

  const entries = [entry(ctx, workoutKey, SCORING_RULES.workoutPoints, "workout", input.id)];
  const bonusKey = `daily:${ctx.userId}:${day}`;
  if (!have.has(bonusKey)) {
    entries.push(entry(ctx, bonusKey, SCORING_RULES.dailyBonusPoints, "daily_bonus", day));
  }
  const points = entries.reduce((s, e) => s + e.points, 0);
  return { workout: { ...base, points }, entries, reason: "awarded" };
}

export function awardChallenge(ctx: AwardContext, challenge: Challenge): LedgerEntry | null {
  const key = `challenge:${challenge.id}:${ctx.userId}`;
  if (ctx.ledger.some((e) => e.key === key)) return null;
  return entry(ctx, key, challenge.rewardPoints, "challenge", challenge.id);
}

export function sumPoints(
  ledger: readonly LedgerEntry[],
  filter: { userId?: string; teamId?: string; since?: string } = {},
): number {
  return ledger
    .filter(
      (e) =>
        (!filter.userId || e.userId === filter.userId) &&
        (!filter.teamId || e.teamId === filter.teamId) &&
        (!filter.since || e.createdAt >= filter.since),
    )
    .reduce((s, e) => s + e.points, 0);
}
