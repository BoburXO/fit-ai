import type { ExerciseId } from "../exercises/types";
import type { WorkoutSource } from "../../types/domain";

/** Minimum effort for a workout to count as "completed". Configurable. */
export const COMPLETION_RULES: Record<ExerciseId, { minReps?: number; minHoldSec?: number }> = {
  squat: { minReps: 5 },
  pushup: { minReps: 3 },
  plank: { minHoldSec: 20 },
};

/** A human cannot do more than this many reps per second (prototype plausibility check). */
const MAX_REPS_PER_SEC = 1.25;

export interface WorkoutInput {
  exerciseId: ExerciseId;
  reps: number;
  holdSec: number;
  durationSec: number;
  source: WorkoutSource;
}

export interface Validation {
  valid: boolean;
  reason?: "demo_source" | "too_short" | "implausible" | "invalid_numbers";
}

/**
 * Prototype anti-cheat only: checks thresholds and plausibility. It cannot prove that the
 * numbers came from a real camera. Production needs server-side signed sessions / review.
 */
export function validateWorkout(w: WorkoutInput): Validation {
  if (![w.reps, w.holdSec, w.durationSec].every((n) => Number.isFinite(n) && n >= 0)) {
    return { valid: false, reason: "invalid_numbers" };
  }
  if (w.source !== "camera") return { valid: false, reason: "demo_source" };
  if (w.reps > w.durationSec * MAX_REPS_PER_SEC + 1) return { valid: false, reason: "implausible" };
  if (w.holdSec > w.durationSec + 1) return { valid: false, reason: "implausible" };
  const rule = COMPLETION_RULES[w.exerciseId];
  if (rule.minReps !== undefined && w.reps < rule.minReps) return { valid: false, reason: "too_short" };
  if (rule.minHoldSec !== undefined && w.holdSec < rule.minHoldSec) return { valid: false, reason: "too_short" };
  return { valid: true };
}
