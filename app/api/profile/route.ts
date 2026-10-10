import { fail, ok } from "@/lib/server/http";
import { getSession } from "@/lib/server/session";
import { getState } from "@/lib/server/store";

export async function GET(req: Request) {
  const session = getSession(req);
  if (!session) return fail("UNAUTHENTICATED", "Avval tizimga kiring.", 401);
  const s = getState(session.userId);
  return ok({ userId: s.userId, role: session.role, profile: s.profile });
}
