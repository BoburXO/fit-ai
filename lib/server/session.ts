import type { Role } from "@/types/domain";

export const SESSION_COOKIE = "fitai_demo_session";

/**
 * PROTOTYPE session: the cookie only selects one of these fixed demo identities, and the
 * server decides role/user id from this table, never from request bodies.
 * Replace with Auth.js (verified session) for real accounts.
 */
export const DEMO_IDENTITIES: Record<string, { userId: string; role: Role }> = {
  student: { userId: "demo-student", role: "student" },
  teacher: { userId: "demo-teacher", role: "teacher" },
};

export function getSession(req: Request): { userId: string; role: Role } | null {
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([a-z]+)`));
  const id = m?.[1];
  return id && DEMO_IDENTITIES[id] ? DEMO_IDENTITIES[id]! : null;
}
