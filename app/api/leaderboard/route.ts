import { fail, ok } from "@/lib/server/http";
import { getSession } from "@/lib/server/session";
import { getState } from "@/lib/server/store";
import { DEMO_PEERS, TEAMS } from "@/lib/storage/state";
import { buildPlayers, buildTeams } from "@/lib/teams/leaderboard";
import { addDays } from "@/lib/workouts/dates";
import { leaderboardQuerySchema } from "@/lib/validation/schemas";

export async function GET(req: Request) {
  const session = getSession(req);
  if (!session) return fail("UNAUTHENTICATED", "Avval tizimga kiring.", 401);
  const q = leaderboardQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!q.success) return fail("VALIDATION", "So‘rov noto‘g‘ri.", 400);
  const s = getState(session.userId);
  const now = new Date().toISOString();
  const input = { me: { id: s.userId, name: s.profile.name, teamId: s.profile.teamId }, peers: DEMO_PEERS, ledger: s.ledger, workouts: s.workouts, teams: TEAMS, weekStartIso: addDays(now, -7) };
  return ok(q.data.scope === "teams" ? buildTeams(input, q.data.period) : buildPlayers(input, q.data.period));
}
