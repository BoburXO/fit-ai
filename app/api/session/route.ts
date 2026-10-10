import { NextResponse } from "next/server";
import { z } from "zod";
import { fail } from "@/lib/server/http";
import { DEMO_IDENTITIES, SESSION_COOKIE } from "@/lib/server/session";

const body = z.object({ identity: z.enum(["student", "teacher"]) }).strict();

/** Prototype login: picks a demo identity. Not real authentication. */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("VALIDATION", "So‘rov noto‘g‘ri.", 400);
  const res = NextResponse.json({ ok: true, data: { userId: DEMO_IDENTITIES[parsed.data.identity]!.userId, prototype: true } });
  res.cookies.set(SESSION_COOKIE, parsed.data.identity, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" });
  return res;
}
