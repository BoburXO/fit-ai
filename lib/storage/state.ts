import type { Challenge, DemoPeer, FitnessLevel, Goal, LedgerEntry, Role, Team, WorkoutRecord } from "../../types/domain";
import { awardChallenge, awardWorkout, type WorkoutAward } from "../scoring/engine";
import { challengeStatus, computeProgress } from "../challenges/progress";
import { addDays, dayKey, DEFAULT_TZ_OFFSET_MIN } from "../workouts/dates";
import type { WorkoutInput } from "../workouts/validate";
import type { PlanState } from "../workouts/plan";

export const STATE_VERSION = 1;
export const DEMO_USER_ID = "demo-student";

export interface Profile {
  name: string;
  role: Role;
  level: FitnessLevel;
  goal: Goal;
  teamId: string | null;
  dailyGoalMin: number;
  waterTargetMl: number;
  /** In-app reminder only (no push notifications). */
  reminderEnabled: boolean;
}

export interface AppState {
  version: number;
  userId: string;
  createdAt: string;
  profile: Profile;
  workouts: WorkoutRecord[];
  ledger: LedgerEntry[];
  /** challengeId -> ISO join time */
  joined: Record<string, string>;
  water: Record<string, number>;
  challenges: Challenge[];
  plan: PlanState | null;
  /** Sample (demo) workouts are present until the user clears them. */
  hasSampleData: boolean;
}

export const TEAMS: Team[] = ["A", "B", "C", "D"].map((l) => ({ id: `10-${l}`, name: `10-${l}`, grade: "10" }));

/** Deterministic sample classmates. Always labelled "Demo" in the UI. */
export const DEMO_PEERS: DemoPeer[] = [
  ["p01", "Aziza K.", "10-A", 170, 640, 9, 31],
  ["p02", "Bekzod R.", "10-A", 140, 520, 7, 25],
  ["p03", "Madina S.", "10-A", 95, 410, 5, 20],
  ["p04", "Javohir T.", "10-B", 160, 600, 8, 29],
  ["p05", "Dilnoza A.", "10-B", 110, 450, 6, 22],
  ["p06", "Sardor M.", "10-B", 60, 300, 3, 15],
  ["p07", "Nilufar B.", "10-C", 150, 580, 8, 28],
  ["p08", "Otabek N.", "10-C", 120, 470, 6, 23],
  ["p09", "Shahlo Y.", "10-C", 70, 330, 4, 16],
  ["p10", "Umid Q.", "10-D", 130, 500, 7, 24],
  ["p11", "Zilola H.", "10-D", 90, 380, 5, 18],
  ["p12", "Rustam D.", "10-D", 45, 240, 2, 12],
].map(([id, name, teamId, weekPoints, totalPoints, weekWorkouts, workouts]) => ({
  id, name, teamId, weekPoints, totalPoints, weekWorkouts, workouts,
})) as DemoPeer[];

function localDayStart(nowIso: string): string {
  return new Date(Date.parse(dayKey(nowIso) + "T00:00:00Z") - DEFAULT_TZ_OFFSET_MIN * 60_000).toISOString();
}

export function seedChallenges(nowIso: string): Challenge[] {
  const start = localDayStart(nowIso);
  const mk = (c: Omit<Challenge, "startsAt" | "endsAt" | "closed" | "isDemo"> & { days: number }): Challenge => {
    const { days, ...rest } = c;
    return { ...rest, startsAt: start, endsAt: addDays(start, days), closed: false, isDemo: true };
  };
  return [
    mk({
      id: "ch-fitness-7",
      title: "7 kunlik Fitness Challenge",
      description: "Har kuni kamida bitta mashqni to‘liq bajaring va 7 kun ketma-ket faol bo‘ling.",
      rules: ["Mashq kamera orqali o‘lchangan va yakunlangan bo‘lishi kerak.", "Demo yozuvlar hisobga olinmaydi.", "7 xil kunda kamida bittadan mashq."],
      kind: "special", scope: "individual", metric: "active_days", target: 7, rewardPoints: 150, days: 7,
    }),
    mk({
      id: "ch-squat-daily",
      title: "Kunlik squat: 20 ta",
      description: "Bugun kamera yordamida jami 20 ta squat bajaring.",
      rules: ["Faqat squat mashqi hisoblanadi.", "Bugun yarim tungacha."],
      kind: "daily", scope: "individual", metric: "reps", exerciseId: "squat", target: 20, rewardPoints: 30, days: 1,
    }),
    mk({
      id: "ch-squat-week",
      title: "Haftalik 100 ta squat",
      description: "Bir hafta ichida jami 100 ta squat to‘plang.",
      rules: ["Faqat squat mashqi hisoblanadi.", "Takroriy mashg‘ulotlar yig‘iladi."],
      kind: "weekly", scope: "individual", metric: "reps", exerciseId: "squat", target: 100, rewardPoints: 60, days: 7,
    }),
    mk({
      id: "ch-minutes-week",
      title: "Haftada 30 daqiqa faollik",
      description: "Kamera orqali yakunlangan mashqlar bilan 30 daqiqa to‘plang.",
      rules: ["Faqat yakunlangan mashqlar vaqti qo‘shiladi."],
      kind: "weekly", scope: "individual", metric: "minutes", target: 30, rewardPoints: 40, days: 7,
    }),
    mk({
      id: "ch-team-marathon",
      title: "Sinflar marafoni: 80 ta mashq",
      description: "Jamoangiz bir hafta ichida 80 ta yakunlangan mashqqa yetsin. Sinfdoshlar natijasi demo ma’lumot.",
      rules: ["Jamoa hisobiga sizning haqiqiy mashqlaringiz va demo sinfdoshlar qo‘shiladi.", "Mukofot uchun kamida bitta o‘z mashqingiz bo‘lishi shart."],
      kind: "weekly", scope: "team", metric: "workouts", target: 80, rewardPoints: 80, days: 7,
    }),
  ];
}

function sampleWorkouts(nowIso: string): WorkoutRecord[] {
  const spec: [number, WorkoutRecord["exerciseId"], number, number, number][] = [
    [1, "squat", 15, 0, 120], [2, "pushup", 10, 0, 90], [3, "plank", 0, 40, 60],
    [4, "squat", 20, 0, 150], [6, "pushup", 12, 0, 100], [7, "squat", 12, 0, 110],
  ];
  return spec.map(([d, exerciseId, reps, holdSec, durationSec], i) => ({
    id: `sample-${i + 1}`,
    exerciseId,
    startedAt: addDays(nowIso, -d),
    durationSec,
    reps,
    holdSec,
    source: "demo" as const,
    completed: true,
    points: 0,
    note: "Namuna yozuv",
  }));
}

export function createInitialState(nowIso: string): AppState {
  return {
    version: STATE_VERSION,
    userId: DEMO_USER_ID,
    createdAt: nowIso,
    profile: {
      name: "Demo o‘quvchi",
      role: "student",
      level: "beginner",
      goal: "active",
      teamId: "10-B",
      dailyGoalMin: 10,
      waterTargetMl: 2000,
      reminderEnabled: true,
    },
    workouts: sampleWorkouts(nowIso),
    ledger: [],
    joined: {},
    water: {},
    challenges: seedChallenges(nowIso),
    plan: null,
    hasSampleData: true,
  };
}

export interface SaveResult {
  state: AppState;
  award: WorkoutAward;
  completedChallenges: Challenge[];
}

/** Team challenge progress adds the (demo) classmates' weekly workouts of the user's team. */
export function teamExtra(state: AppState, c: Challenge): number {
  if (c.scope !== "team" || !state.profile.teamId) return 0;
  return DEMO_PEERS.filter((p) => p.teamId === state.profile.teamId).reduce((s, p) => s + p.weekWorkouts, 0);
}

export function challengeProgress(state: AppState, c: Challenge) {
  const joinedAt = state.joined[c.id];
  if (!joinedAt) return null;
  return computeProgress(c, state.workouts, joinedAt, teamExtra(state, c));
}

/**
 * Records a finished workout. Points come ONLY from the scoring engine; the caller cannot
 * supply them. Challenge rewards are granted here, once, when the rule is satisfied.
 */
export function saveWorkout(
  state: AppState,
  input: WorkoutInput & { id: string; startedAt: string },
  nowIso: string,
): SaveResult {
  const ctx = { userId: state.userId, teamId: state.profile.teamId, ledger: state.ledger, now: nowIso };
  const award = awardWorkout(ctx, input);
  let next: AppState = {
    ...state,
    workouts: state.workouts.some((w) => w.id === award.workout.id) ? state.workouts : [award.workout, ...state.workouts],
    ledger: [...state.ledger, ...award.entries],
  };

  const completedChallenges: Challenge[] = [];
  for (const c of next.challenges) {
    if (!next.joined[c.id] || challengeStatus(c, nowIso) !== "active") continue;
    const p = challengeProgress(next, c);
    if (!p?.completed) continue;
    if (c.scope === "team" && !next.workouts.some((w) => w.source === "camera" && w.completed && w.startedAt >= c.startsAt)) continue;
    const e = awardChallenge({ ...ctx, ledger: next.ledger }, c);
    if (e) {
      next = { ...next, ledger: [...next.ledger, e] };
      completedChallenges.push(c);
    }
  }
  return { state: next, award, completedChallenges };
}

export function joinChallenge(state: AppState, id: string, nowIso: string): { state: AppState; error?: string } {
  const c = state.challenges.find((x) => x.id === id);
  if (!c) return { state, error: "Challenge topilmadi." };
  if (state.joined[id]) return { state, error: "Bu challenge’ga allaqachon qo‘shilgansiz." };
  if (challengeStatus(c, nowIso) !== "active") return { state, error: "Bu challenge hozir faol emas." };
  return { state: { ...state, joined: { ...state.joined, [id]: nowIso } } };
}

export function setTeam(state: AppState, teamId: string | null): AppState {
  if (teamId !== null && !TEAMS.some((t) => t.id === teamId)) return state;
  return { ...state, profile: { ...state.profile, teamId } };
}

export function addWater(state: AppState, nowIso: string, ml: number): AppState {
  const k = dayKey(nowIso);
  const cur = state.water[k] ?? 0;
  const next = Math.min(10_000, Math.max(0, cur + ml));
  return { ...state, water: { ...state.water, [k]: next } };
}

export function clearSampleData(state: AppState): AppState {
  return { ...state, workouts: state.workouts.filter((w) => w.source !== "demo"), hasSampleData: false };
}
