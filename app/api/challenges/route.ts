import { fail, ok } from "@/lib/server/http";
import { getSession } from "@/lib/server/session";
import { getState } from "@/lib/server/store";
import { challengeProgress } from "@/lib/storage/state";
import { challengeStatus } from "@/lib/challenges/progress";

export async function GET(req: Request) {
  const session = getSession(req);
  if (!session) return fail("UNAUTHENTICATED", "Avval tizimga kiring.", 401);
  const s = getState(session.userId);
  const now = new Date().toISOString();
  return ok(s.challenges.map((c) => ({ ...c, status: challengeStatus(c, now), joined: !!s.joined[c.id], progress: challengeProgress(s, c) })));
}
