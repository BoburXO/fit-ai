import type { DemoPeer, LedgerEntry, Team, WorkoutRecord } from "../../types/domain";
import { sumPoints } from "../scoring/engine";

export type Period = "week" | "all";

export interface PlayerRow {
  id: string;
  name: string;
  teamId: string;
  points: number;
  workouts: number;
  isDemo: boolean;
  isMe: boolean;
  rank: number;
}

export interface TeamRow {
  teamId: string;
  name: string;
  points: number;
  workouts: number;
  activeMembers: number;
  rank: number;
}

export interface BoardInput {
  me: { id: string; name: string; teamId: string | null };
  peers: readonly DemoPeer[];
  ledger: readonly LedgerEntry[];
  workouts: readonly WorkoutRecord[];
  teams: readonly Team[];
  weekStartIso: string;
}

/** Competition ranking: equal (points, workouts) share a rank. */
function assignRanks<T extends { points: number; workouts: number }>(rows: T[]): (T & { rank: number })[] {
  let prev: T | null = null;
  let rank = 0;
  return rows.map((r, i) => {
    if (!prev || prev.points !== r.points || prev.workouts !== r.workouts) rank = i + 1;
    prev = r;
    return { ...r, rank };
  });
}

export function buildPlayers(input: BoardInput, period: Period): PlayerRow[] {
  const since = period === "week" ? input.weekStartIso : undefined;
  const myWorkouts = input.workouts.filter(
    (w) => w.points > 0 && (!since || w.startedAt >= since),
  ).length;
  const rows: Omit<PlayerRow, "rank">[] = input.peers.map((p) => ({
    id: p.id,
    name: p.name,
    teamId: p.teamId,
    points: period === "week" ? p.weekPoints : p.totalPoints,
    workouts: period === "week" ? p.weekWorkouts : p.workouts,
    isDemo: true,
    isMe: false,
  }));
  if (input.me.teamId) {
    rows.push({
      id: input.me.id,
      name: input.me.name,
      teamId: input.me.teamId,
      points: sumPoints(input.ledger, { userId: input.me.id, since }),
      workouts: myWorkouts,
      isDemo: false,
      isMe: true,
    });
  }
  rows.sort((a, b) => b.points - a.points || b.workouts - a.workouts || a.name.localeCompare(b.name, "uz"));
  return assignRanks(rows);
}

export function buildTeams(input: BoardInput, period: Period): TeamRow[] {
  const players = buildPlayers(input, period);
  const rows = input.teams.map((t) => {
    const members = players.filter((p) => p.teamId === t.id);
    return {
      teamId: t.id,
      name: t.name,
      points: members.reduce((s, m) => s + m.points, 0),
      workouts: members.reduce((s, m) => s + m.workouts, 0),
      activeMembers: members.filter((m) => m.points > 0).length,
    };
  });
  rows.sort((a, b) => b.points - a.points || b.workouts - a.workouts || a.name.localeCompare(b.name, "uz"));
  return assignRanks(rows);
}
