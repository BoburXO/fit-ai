import { fail, ok } from "@/lib/server/http";
import { getSession } from "@/lib/server/session";
import { getState, putState } from "@/lib/server/store";
import { joinChallenge } from "@/lib/storage/state";
import { joinChallengeSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const session = getSession(req);
  if (!session) return fail("UNAUTHENTICATED", "Avval tizimga kiring.", 401);
  const parsed = joinChallengeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("VALIDATION", "So‘rov noto‘g‘ri.", 400);
  const r = joinChallenge(getState(session.userId), parsed.data.challengeId, new Date().toISOString());
  if (r.error) return fail("CONFLICT", r.error, 409);
  putState(r.state);
  return ok({ joined: parsed.data.challengeId }, 201);
}
