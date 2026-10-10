import { clientKey, fail, ok, rateLimited } from "@/lib/server/http";
import { getSession } from "@/lib/server/session";
import { getState, putState } from "@/lib/server/store";
import { saveWorkout } from "@/lib/storage/state";
import { can } from "@/lib/auth/permissions";
import { workoutRequestSchema } from "@/lib/validation/schemas";

export async function GET(req: Request) {
  const session = getSession(req);
  if (!session) return fail("UNAUTHENTICATED", "Avval tizimga kiring.", 401);
  return ok(getState(session.userId).workouts);
}

export async function POST(req: Request) {
  if (rateLimited(clientKey(req, "workouts"))) return fail("RATE_LIMITED", "Juda ko‘p so‘rov. Birozdan keyin urinib ko‘ring.", 429);
  const session = getSession(req);
  if (!session) return fail("UNAUTHENTICATED", "Avval tizimga kiring.", 401);
  if (!can(session.role, "workout:write")) return fail("FORBIDDEN", "Ushbu amal uchun ruxsatingiz yo‘q.", 403);

  const parsed = workoutRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("VALIDATION", "Mashq ma’lumotlari noto‘g‘ri.", 400);
  const w = parsed.data;

  try {
    // User id comes from the session; points come from the scoring engine. Client sends neither.
    const result = saveWorkout(getState(session.userId), { id: `w_${w.clientId}`, exerciseId: w.exerciseId, reps: w.reps, holdSec: w.holdSec, durationSec: w.durationSec, startedAt: w.startedAt, source: w.source }, new Date().toISOString());
    putState(result.state);
    return ok({ workout: result.award.workout, status: result.award.reason, completedChallenges: result.completedChallenges.map((c) => c.id) }, result.award.reason === "duplicate" ? 200 : 201);
  } catch {
    return fail("SERVER", "Mashqni saqlashda xatolik yuz berdi.", 500);
  }
}
