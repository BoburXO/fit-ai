import type { Landmark } from "../lib/exercises/types";

export function blank(): Landmark[] {
  return Array.from({ length: 33 }, () => ({ x: 0, y: 0, visibility: 0 }));
}

const rad = (d: number) => (d * Math.PI) / 180;

/** Side-view pose whose left knee angle (hip-knee-ankle) equals `knee` degrees. */
export function squatPose(knee: number, visibility = 0.95): Landmark[] {
  const lm = blank();
  const k = { x: 0.5, y: 0.6 };
  lm[27] = { x: k.x, y: k.y + 0.2, visibility };
  lm[25] = { ...k, visibility };
  lm[23] = { x: k.x + 0.2 * Math.sin(rad(knee)), y: k.y + 0.2 * Math.cos(rad(knee)), visibility };
  return lm;
}

/** Horizontal body, left elbow angle = `elbow` degrees. */
export function pushupPose(elbow: number, opts: { tilted?: boolean; visibility?: number } = {}): Landmark[] {
  const v = opts.visibility ?? 0.95;
  const lm = blank();
  const shoulder = { x: 0.25, y: opts.tilted ? 0.2 : 0.5 };
  const ankle = { x: 0.8, y: 0.62 };
  const e = { x: shoulder.x + 0.1, y: shoulder.y + 0.05 };
  const ux = shoulder.x - e.x;
  const uy = shoulder.y - e.y;
  const len = Math.hypot(ux, uy);
  const a = rad(elbow);
  const wx = e.x + ((ux * Math.cos(a) - uy * Math.sin(a)) / len) * 0.12;
  const wy = e.y + ((ux * Math.sin(a) + uy * Math.cos(a)) / len) * 0.12;
  lm[11] = { ...shoulder, visibility: v };
  lm[13] = { ...e, visibility: v };
  lm[15] = { x: wx, y: wy, visibility: v };
  lm[27] = { ...ankle, visibility: v };
  return lm;
}

/** Horizontal body where shoulder-hip-ankle angle = `align` degrees. */
export function plankPose(align: number, visibility = 0.95): Landmark[] {
  const lm = blank();
  const s = { x: 0.2, y: 0.5 };
  const a = { x: 0.8, y: 0.55 };
  const mid = { x: (s.x + a.x) / 2, y: (s.y + a.y) / 2 };
  const half = Math.hypot(a.x - s.x, a.y - s.y) / 2;
  const d = half * Math.tan(rad((180 - align) / 2));
  lm[11] = { ...s, visibility };
  lm[23] = { x: mid.x, y: mid.y - d, visibility };
  lm[27] = { ...a, visibility };
  return lm;
}
