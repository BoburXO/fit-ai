import { describe, expect, it } from "vitest";
import { awardChallenge, awardWorkout, SCORING_RULES, sumPoints } from "../lib/scoring/engine";
import { computeProgress, challengeStatus } from "../lib/challenges/progress";
import { buildPlayers, buildTeams } from "../lib/teams/leaderboard";
import { validateWorkout } from "../lib/workouts/validate";
import type { Challenge, DemoPeer, LedgerEntry, Team, WorkoutRecord } from "../types/domain";

const NOW = "2026-10-10T08:00:00.000Z";
const ctx = (ledger: LedgerEntry[] = []) => ({ userId: "u1", teamId: "10-A", ledger, now: NOW });
const squat = (id: string, over: Partial<Parameters<typeof awardWorkout>[1]> = {}) => ({
  id,
  exerciseId: "squat" as const,
  reps: 10,
  holdSec: 0,
  durationSec: 40,
  source: "camera" as const,
  startedAt: NOW,
  ...over,
});

describe("workout completion", () => {
  it("accepts a camera workout above the threshold", () => {
    expect(validateWorkout(squat("a")).valid).toBe(true);
  });
  it("rejects too few reps, demo source and implausible speed", () => {
    expect(validateWorkout(squat("a", { reps: 2 })).reason).toBe("too_short");
    expect(validateWorkout(squat("a", { source: "demo" })).reason).toBe("demo_source");
    expect(validateWorkout(squat("a", { reps: 200, durationSec: 10 })).reason).toBe("implausible");
    expect(validateWorkout(squat("a", { reps: NaN })).reason).toBe("invalid_numbers");
  });
  it("plank needs minimum hold", () => {
    const p = { exerciseId: "plank" as const, reps: 0, source: "camera" as const };
    expect(validateWorkout({ ...p, holdSec: 10, durationSec: 15 }).valid).toBe(false);
    expect(validateWorkout({ ...p, holdSec: 25, durationSec: 30 }).valid).toBe(true);
  });
});

describe("points calculation", () => {
  it("awards workout points plus one daily bonus", () => {
    const r = awardWorkout(ctx(), squat("w1"));
    expect(r.reason).toBe("awarded");
    expect(r.workout.points).toBe(SCORING_RULES.workoutPoints + SCORING_RULES.dailyBonusPoints);
    expect(r.entries.map((e) => e.reason)).toEqual(["workout", "daily_bonus"]);
  });
  it("gives the daily bonus only once per day", () => {
    const first = awardWorkout(ctx(), squat("w1"));
    const second = awardWorkout(ctx(first.entries), squat("w2"));
    expect(second.workout.points).toBe(SCORING_RULES.workoutPoints);
    expect(second.entries).toHaveLength(1);
  });
  it("awards nothing for invalid workouts", () => {
    const r = awardWorkout(ctx(), squat("w1", { reps: 1 }));
    expect(r.entries).toHaveLength(0);
    expect(r.workout.points).toBe(0);
    expect(r.workout.completed).toBe(false);
  });
});

describe("duplicate reward prevention", () => {
  it("re-submitting the same workout id awards nothing", () => {
    const first = awardWorkout(ctx(), squat("w1"));
    const again = awardWorkout(ctx(first.entries), squat("w1"));
    expect(again.reason).toBe("duplicate");
    expect(again.entries).toHaveLength(0);
  });
  it("enforces the per-day scored workout limit", () => {
    let ledger: LedgerEntry[] = [];
    for (let i = 0; i < SCORING_RULES.maxScoredWorkoutsPerDay; i++) {
      ledger = [...ledger, ...awardWorkout(ctx(ledger), squat(`w${i}`)).entries];
    }
    expect(awardWorkout(ctx(ledger), squat("extra")).reason).toBe("daily_limit");
  });
  it("challenge reward is awarded once", () => {
    const ch = { id: "c1", rewardPoints: 50 } as Challenge;
    const e = awardChallenge(ctx(), ch);
    expect(e?.points).toBe(50);
    expect(awardChallenge(ctx([e!]), ch)).toBeNull();
  });
});

const challenge = (over: Partial<Challenge> = {}): Challenge => ({
  id: "c1",
  title: "t",
  description: "",
  rules: [],
  kind: "weekly",
  scope: "individual",
  metric: "workouts",
  target: 3,
  rewardPoints: 50,
  startsAt: "2026-10-05T00:00:00.000Z",
  endsAt: "2026-10-12T00:00:00.000Z",
  closed: false,
  isDemo: false,
  ...over,
});
const wr = (id: string, startedAt: string, over: Partial<WorkoutRecord> = {}): WorkoutRecord => ({
  id,
  exerciseId: "squat",
  startedAt,
  durationSec: 60,
  reps: 10,
  holdSec: 0,
  source: "camera",
  completed: true,
  points: 25,
  ...over,
});

describe("challenge progress", () => {
  const joined = "2026-10-05T00:00:00.000Z";
  it("counts only completed camera workouts inside the window", () => {
    const ws = [
      wr("a", "2026-10-06T10:00:00.000Z"),
      wr("b", "2026-10-07T10:00:00.000Z", { source: "demo" }),
      wr("c", "2026-10-07T11:00:00.000Z", { completed: false }),
      wr("d", "2026-10-20T10:00:00.000Z"),
      wr("e", "2026-10-04T10:00:00.000Z"),
    ];
    const p = computeProgress(challenge(), ws, joined);
    expect(p.current).toBe(1);
    expect(p.completed).toBe(false);
  });
  it("completes when the rule is satisfied", () => {
    const ws = ["06", "07", "08"].map((d) => wr(d, `2026-10-${d}T10:00:00.000Z`));
    expect(computeProgress(challenge(), ws, joined).completed).toBe(true);
  });
  it("ignores workouts made before joining", () => {
    const ws = [wr("a", "2026-10-06T10:00:00.000Z")];
    expect(computeProgress(challenge(), ws, "2026-10-08T00:00:00.000Z").current).toBe(0);
  });
  it("active_days counts distinct days", () => {
    const ws = [wr("a", "2026-10-06T06:00:00.000Z"), wr("b", "2026-10-06T08:00:00.000Z"), wr("c", "2026-10-07T08:00:00.000Z")];
    expect(computeProgress(challenge({ metric: "active_days", target: 7 }), ws, joined).current).toBe(2);
  });
  it("status reflects deadline and manual close", () => {
    expect(challengeStatus(challenge(), "2026-10-10T00:00:00.000Z")).toBe("active");
    expect(challengeStatus(challenge(), "2026-10-13T00:00:00.000Z")).toBe("closed");
    expect(challengeStatus(challenge({ closed: true }), "2026-10-10T00:00:00.000Z")).toBe("closed");
    expect(challengeStatus(challenge(), "2026-10-01T00:00:00.000Z")).toBe("upcoming");
  });
});

describe("leaderboard sorting", () => {
  const teams: Team[] = [
    { id: "10-A", name: "10-A", grade: "10" },
    { id: "10-B", name: "10-B", grade: "10" },
  ];
  const peer = (id: string, teamId: string, total: number, workouts: number): DemoPeer => ({
    id, name: id, teamId, totalPoints: total, weekPoints: total, workouts, weekWorkouts: workouts,
  });
  const base = {
    me: { id: "u1", name: "Men", teamId: "10-B" as string | null },
    peers: [peer("p1", "10-A", 100, 5), peer("p2", "10-B", 100, 4), peer("p3", "10-A", 40, 2)],
    ledger: [] as LedgerEntry[],
    workouts: [] as WorkoutRecord[],
    teams,
    weekStartIso: "2026-10-04T00:00:00.000Z",
  };

  it("sorts by points then workouts and shares ranks on ties", () => {
    const rows = buildPlayers(base, "all");
    expect(rows.map((r) => r.id)).toEqual(["p1", "p2", "p3", "u1"]);
    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3, 4]);
    const tied = buildPlayers({ ...base, peers: [peer("a", "10-A", 50, 3), peer("b", "10-A", 50, 3)] }, "all");
    expect(tied.map((r) => r.rank)).toEqual([1, 1, 3]);
  });
  it("includes my recorded points and recomputes team totals from them", () => {
    const l = awardWorkout({ userId: "u1", teamId: "10-B", ledger: [], now: NOW }, squat("w1"));
    const input = { ...base, ledger: l.entries, workouts: [l.workout] };
    const me = buildPlayers(input, "all").find((r) => r.isMe)!;
    expect(me.points).toBe(25);
    expect(sumPoints(l.entries, { userId: "u1" })).toBe(25);
    const teamB = buildTeams(input, "all").find((t) => t.teamId === "10-B")!;
    expect(teamB.points).toBe(125);
  });
  it("is deterministic", () => {
    expect(buildTeams(base, "all")).toEqual(buildTeams(base, "all"));
  });
  it("leaves me out when I have no team", () => {
    expect(buildPlayers({ ...base, me: { ...base.me, teamId: null } }, "all").some((r) => r.isMe)).toBe(false);
  });
});
