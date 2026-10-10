import { describe, expect, it } from "vitest";
import { can, ownsRecord } from "../lib/auth/permissions";
import { createInitialState, saveWorkout, joinChallenge, challengeProgress, addWater, clearSampleData } from "../lib/storage/state";
import { currentStreak, personalRecords, totals } from "../lib/workouts/stats";
import { generatePlan, planProgress } from "../lib/workouts/plan";
import { buildTeams } from "../lib/teams/leaderboard";
import { DEMO_PEERS, TEAMS } from "../lib/storage/state";

const NOW = "2026-10-10T08:00:00.000Z";
const input = (id: string, over = {}) => ({
  id, exerciseId: "squat" as const, reps: 25, holdSec: 0, durationSec: 80, source: "camera" as const, startedAt: NOW, ...over,
});

describe("end-to-end workout -> points -> leaderboard -> challenge", () => {
  it("saving a camera workout updates points, team ranking and challenge progress", () => {
    let s = createInitialState(NOW);
    s = joinChallenge(s, "ch-squat-daily", NOW).state;
    const before = buildTeams({ me: { id: s.userId, name: "Men", teamId: s.profile.teamId }, peers: DEMO_PEERS, ledger: s.ledger, workouts: s.workouts, teams: TEAMS, weekStartIso: "2026-10-04T00:00:00.000Z" }, "all");
    const r = saveWorkout(s, input("w1"), NOW);
    expect(r.award.reason).toBe("awarded");
    expect(r.completedChallenges.map((c) => c.id)).toEqual(["ch-squat-daily"]);
    // 20 workout + 5 daily + 30 challenge reward
    expect(r.state.ledger.reduce((a, e) => a + e.points, 0)).toBe(55);
    const after = buildTeams({ me: { id: s.userId, name: "Men", teamId: s.profile.teamId }, peers: DEMO_PEERS, ledger: r.state.ledger, workouts: r.state.workouts, teams: TEAMS, weekStartIso: "2026-10-04T00:00:00.000Z" }, "all");
    const b = (rows: typeof before) => rows.find((t) => t.teamId === "10-B")!.points;
    expect(b(after) - b(before)).toBe(55);
    expect(challengeProgress(r.state, r.state.challenges.find((c) => c.id === "ch-squat-daily")!)?.completed).toBe(true);
  });

  it("saving the same workout twice or via demo source never double awards", () => {
    let s = createInitialState(NOW);
    s = saveWorkout(s, input("w1"), NOW).state;
    const total = s.ledger.length;
    s = saveWorkout(s, input("w1"), NOW).state;
    expect(s.ledger).toHaveLength(total);
    expect(s.workouts.filter((w) => w.id === "w1")).toHaveLength(1);
    const demo = saveWorkout(s, input("w2", { source: "demo" }), NOW);
    expect(demo.award.workout.points).toBe(0);
    expect(demo.state.ledger).toHaveLength(total);
  });

  it("cannot join the same challenge twice", () => {
    const s = joinChallenge(createInitialState(NOW), "ch-fitness-7", NOW).state;
    expect(joinChallenge(s, "ch-fitness-7", NOW).error).toBe("Bu challenge’ga allaqachon qo‘shilgansiz.");
  });
});

describe("stats", () => {
  it("sample data is flagged and can be cleared", () => {
    const s = createInitialState(NOW);
    expect(totals(s.workouts).sample).toBeGreaterThan(0);
    const cleared = clearSampleData(s);
    expect(totals(cleared.workouts).workouts).toBe(0);
    expect(personalRecords(s.workouts).squatReps).toBe(0); // samples are not real records
  });
  it("streak counts consecutive days only", () => {
    const s = saveWorkout(createInitialState(NOW), input("w1"), NOW).state;
    const ws = clearSampleData(s).workouts;
    expect(currentStreak(ws, NOW)).toBe(1);
    expect(currentStreak([], NOW)).toBe(0);
  });
  it("water is capped and per-day", () => {
    let s = createInitialState(NOW);
    s = addWater(s, NOW, 250);
    s = addWater(s, NOW, 250);
    expect(Object.values(s.water)).toEqual([500]);
    expect(Object.values(addWater(s, NOW, -9999).water)).toEqual([0]);
  });
});

describe("plan generator and authorization", () => {
  it("is deterministic, respects level and rest days", () => {
    const prefs = { level: "beginner" as const, goal: "active" as const, minutesPerDay: 10, categories: ["beginner" as const], restDays: 2 };
    const a = generatePlan(prefs, NOW);
    expect(a).toEqual(generatePlan(prefs, NOW));
    expect(a.days.filter((d) => d.rest)).toHaveLength(2);
    expect(a.days.flatMap((d) => d.items).every((i) => i.exerciseId !== "mountain-climber")).toBe(true);
    expect(planProgress(a).percent).toBe(0);
  });
  it("only teachers can manage challenges; users own only their records", () => {
    expect(can("student", "challenge:manage")).toBe(false);
    expect(can("teacher", "challenge:manage")).toBe(true);
    expect(can(null, "workout:read")).toBe(false);
    expect(ownsRecord("a", "a")).toBe(true);
    expect(ownsRecord("a", "b")).toBe(false);
    expect(ownsRecord(null, "b")).toBe(false);
  });
});
