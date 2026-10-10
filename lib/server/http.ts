import { NextResponse } from "next/server";

export const ok = <T,>(data: T, status = 200) => NextResponse.json({ ok: true, data }, { status });

export const fail = (code: string, message: string, status: number) =>
  NextResponse.json({ ok: false, error: { code, message } }, { status });

const hits = new Map<string, number[]>();

/** Prototype in-memory limiter (per server instance). Production: Redis/edge limiter. */
export function rateLimited(key: string, max = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}

export function clientKey(req: Request, route: string): string {
  return `${route}:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"}`;
}
