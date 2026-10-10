import { EXERCISES, type Category, type Difficulty } from "../exercises/library";
import type { FitnessLevel, Goal } from "../../types/domain";

export interface PlanPrefs {
  level: FitnessLevel;
  goal: Goal;
  minutesPerDay: number;
  categories: Category[];
  /** Number of rest days per week (0..3). */
  restDays: number;
}

export interface PlanItem {
  exerciseId: string;
  sets: number;
  reps?: number;
  holdSec?: number;
  done: boolean;
}

export interface PlanDay {
  label: string;
  rest: boolean;
  items: PlanItem[];
  minutes: number;
}

export interface PlanState {
  prefs: PlanPrefs;
  days: PlanDay[];
  generatedAt: string;
}

const DAY_LABELS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
const LEVEL_RANK: Record<Difficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 };
const SETS: Record<FitnessLevel, number> = { beginner: 2, intermediate: 3, advanced: 4 };
const REP_FACTOR: Record<FitnessLevel, number> = { beginner: 0.8, intermediate: 1, advanced: 1.25 };
const GOAL_CATEGORY: Record<Goal, Category> = { active: "beginner", strength: "strength", endurance: "cardio" };
/** Rest days are spread out; indexes into Mon..Sun. */
const REST_SLOTS = [6, 3, 1];

/**
 * Transparent rule-based planner (NOT a trained model):
 * 1. keep exercises whose difficulty <= user level
 * 2. prefer the chosen categories and the goal's category
 * 3. rotate through them day by day, adding exercises until the time budget is used
 */
export function generatePlan(prefs: PlanPrefs, nowIso: string): PlanState {
  const wanted = new Set<Category>([...prefs.categories, GOAL_CATEGORY[prefs.goal]]);
  const pool = EXERCISES.filter((e) => LEVEL_RANK[e.difficulty] <= LEVEL_RANK[prefs.level]).sort(
    (a, b) => Number(b.categories.some((c) => wanted.has(c))) - Number(a.categories.some((c) => wanted.has(c))),
  );
  const preferred = pool.filter((e) => e.categories.some((c) => wanted.has(c)));
  const source = preferred.length >= 3 ? preferred : pool;
  const rest = new Set(REST_SLOTS.slice(0, Math.min(3, Math.max(0, prefs.restDays))));
  let cursor = 0;

  const days: PlanDay[] = DAY_LABELS.map((label, d) => {
    if (rest.has(d)) return { label, rest: true, items: [], minutes: 0 };
    const items: PlanItem[] = [];
    let minutes = 0;
    let guard = 0;
    while (minutes < prefs.minutesPerDay && guard++ < source.length) {
      const e = source[cursor % source.length]!;
      cursor += 1;
      const sets = SETS[prefs.level];
      const est = Math.max(1, Math.round(e.durationMin * (sets / 2)));
      if (items.length > 0 && minutes + est > prefs.minutesPerDay + 2) continue;
      items.push({
        exerciseId: e.id,
        sets,
        reps: e.reps ? Math.round(e.reps * REP_FACTOR[prefs.level]) : undefined,
        holdSec: e.holdSec ? Math.round(e.holdSec * REP_FACTOR[prefs.level]) : undefined,
        done: false,
      });
      minutes += est;
    }
    return { label, rest: false, items, minutes };
  });
  return { prefs, days, generatedAt: nowIso };
}

export function planProgress(plan: PlanState): { done: number; total: number; percent: number } {
  const items = plan.days.flatMap((d) => d.items);
  const done = items.filter((i) => i.done).length;
  return { done, total: items.length, percent: items.length ? Math.round((done / items.length) * 100) : 0 };
}
