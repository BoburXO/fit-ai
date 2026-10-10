import { z } from "zod";

export const exerciseIdSchema = z.enum(["squat", "pushup", "plank"]);

/** Body of POST /api/workouts. Note: there is deliberately no `points` and no `userId`. */
export const workoutRequestSchema = z
  .object({
    clientId: z.string().min(8).max(64).regex(/^[A-Za-z0-9_-]+$/),
    exerciseId: exerciseIdSchema,
    reps: z.number().int().min(0).max(500),
    holdSec: z.number().min(0).max(3600),
    durationSec: z.number().min(1).max(7200),
    startedAt: z.string().datetime(),
    source: z.enum(["camera", "demo"]),
  })
  .strict();

export const joinChallengeSchema = z.object({ challengeId: z.string().min(1).max(64) }).strict();
export const joinTeamSchema = z.object({ teamId: z.string().min(1).max(16).nullable() }).strict();
export const leaderboardQuerySchema = z.object({
  period: z.enum(["week", "all"]).default("week"),
  scope: z.enum(["players", "teams"]).default("players"),
});

export const challengeFormSchema = z.object({
  title: z.string().trim().min(3).max(80),
  description: z.string().trim().min(3).max(300),
  kind: z.enum(["daily", "weekly", "special"]),
  scope: z.enum(["individual", "team"]),
  metric: z.enum(["workouts", "reps", "active_days", "minutes"]),
  exerciseId: exerciseIdSchema.optional(),
  target: z.number().int().min(1).max(10_000),
  rewardPoints: z.number().int().min(0).max(1000),
  days: z.number().int().min(1).max(60),
});

const iso = z.string().datetime();
const workoutRecord = z.object({
  id: z.string().min(1),
  exerciseId: exerciseIdSchema,
  startedAt: iso,
  durationSec: z.number().min(0),
  reps: z.number().min(0),
  holdSec: z.number().min(0),
  source: z.enum(["camera", "demo"]),
  completed: z.boolean(),
  points: z.number().min(0),
  note: z.string().optional(),
});
const ledgerEntry = z.object({
  id: z.string(), key: z.string(), userId: z.string(), teamId: z.string().nullable(),
  points: z.number(), reason: z.enum(["workout", "daily_bonus", "challenge"]), refId: z.string(), createdAt: iso,
});
const challenge = z.object({
  id: z.string(), title: z.string(), description: z.string(), rules: z.array(z.string()),
  kind: z.enum(["daily", "weekly", "special"]), scope: z.enum(["individual", "team"]),
  metric: z.enum(["workouts", "reps", "active_days", "minutes"]), exerciseId: exerciseIdSchema.optional(),
  target: z.number(), rewardPoints: z.number(), startsAt: iso, endsAt: iso, closed: z.boolean(), isDemo: z.boolean(),
});

/** Validates what we read back from localStorage; anything malformed is discarded. */
export const storedStateSchema = z.object({
  version: z.literal(1),
  userId: z.string(),
  createdAt: iso,
  profile: z.object({
    name: z.string().max(60),
    role: z.enum(["student", "teacher"]),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    goal: z.enum(["active", "strength", "endurance"]),
    teamId: z.string().nullable(),
    dailyGoalMin: z.number().min(1).max(300),
    waterTargetMl: z.number().min(250).max(10_000),
    reminderEnabled: z.boolean(),
  }),
  workouts: z.array(workoutRecord),
  ledger: z.array(ledgerEntry),
  joined: z.record(z.string(), iso),
  water: z.record(z.string(), z.number().min(0)),
  challenges: z.array(challenge),
  plan: z.any().nullable(),
  hasSampleData: z.boolean(),
});
