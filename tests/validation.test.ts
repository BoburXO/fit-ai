import { describe, expect, it } from "vitest";
import { joinTeamSchema, leaderboardQuerySchema, workoutRequestSchema } from "../lib/validation/schemas";

const valid = { clientId: "abcdefgh1234", exerciseId: "squat", reps: 10, holdSec: 0, durationSec: 40, startedAt: "2026-10-10T08:00:00.000Z", source: "camera" };

describe("request validation", () => {
  it("accepts a valid workout request", () => {
    expect(workoutRequestSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects client-supplied points or user ids (strict schema)", () => {
    expect(workoutRequestSchema.safeParse({ ...valid, points: 9999 }).success).toBe(false);
    expect(workoutRequestSchema.safeParse({ ...valid, userId: "someone-else" }).success).toBe(false);
  });
  it("rejects out-of-range and malformed values", () => {
    expect(workoutRequestSchema.safeParse({ ...valid, reps: -1 }).success).toBe(false);
    expect(workoutRequestSchema.safeParse({ ...valid, reps: 1e6 }).success).toBe(false);
    expect(workoutRequestSchema.safeParse({ ...valid, exerciseId: "deadlift" }).success).toBe(false);
    expect(workoutRequestSchema.safeParse({ ...valid, startedAt: "yesterday" }).success).toBe(false);
  });
  it("validates team join and leaderboard queries", () => {
    expect(joinTeamSchema.safeParse({ teamId: null }).success).toBe(true);
    expect(joinTeamSchema.safeParse({ teamId: 5 }).success).toBe(false);
    expect(leaderboardQuerySchema.parse({}).period).toBe("week");
  });
});
