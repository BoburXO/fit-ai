import { fail, ok } from "@/lib/server/http";
import { getSession } from "@/lib/server/session";
import { getState, putState } from "@/lib/server/store";
import { setTeam, TEAMS } from "@/lib/storage/state";
import { joinTeamSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const session = getSession(req);
  if (!session) return fail("UNAUTHENTICATED", "Avval tizimga kiring.", 401);
  const parsed = joinTeamSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("VALIDATION", "So‘rov noto‘g‘ri.", 400);
  if (parsed.data.teamId !== null && !TEAMS.some((t) => t.id === parsed.data.teamId)) return fail("NOT_FOUND", "Jamoa topilmadi.", 404);
  const next = setTeam(getState(session.userId), parsed.data.teamId);
  putState(next);
  return ok({ teamId: next.profile.teamId });
}
