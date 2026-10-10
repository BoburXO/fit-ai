import type { ExerciseId } from "../lib/exercises/types";

export type WorkoutSource = "camera" | "demo";
export type Role = "student" | "teacher";
export type FitnessLevel = "beginner" | "intermediate" | "advanced";
export type Goal = "active" | "strength" | "endurance";

export interface WorkoutRecord {
  id: string;
  exerciseId: ExerciseId;
  startedAt: string; // ISO
  durationSec: number;
  reps: number;
  holdSec: number;
  /** camera = measured from real pose landmarks. demo = sample record, never awards points. */
  source: WorkoutSource;
  completed: boolean;
  points: number;
  note?: string;
}

export type LedgerReason = "workout" | "daily_bonus" | "challenge";

export interface LedgerEntry {
  id: string;
  /** Unique idempotency key: the same event can never be awarded twice. */
  key: string;
  userId: string;
  teamId: string | null;
  points: number;
  reason: LedgerReason;
  refId: string;
  createdAt: string;
}

export type ChallengeScope = "individual" | "team";
export type ChallengeKind = "daily" | "weekly" | "special";
export type ChallengeMetric = "workouts" | "reps" | "active_days" | "minutes";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rules: string[];
  kind: ChallengeKind;
  scope: ChallengeScope;
  metric: ChallengeMetric;
  exerciseId?: ExerciseId;
  target: number;
  rewardPoints: number;
  startsAt: string;
  endsAt: string;
  /** Organizer can close a challenge early. */
  closed: boolean;
  isDemo: boolean;
}

export interface Team {
  id: string;
  name: string;
  grade: string;
}

export interface DemoPeer {
  id: string;
  name: string;
  teamId: string;
  weekPoints: number;
  totalPoints: number;
  workouts: number;
  weekWorkouts: number;
}
