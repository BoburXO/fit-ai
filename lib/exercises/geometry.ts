import type { Landmark } from "./types";

/** Angle at point b (degrees, 0..180) formed by a-b-c. */
export function angleDeg(a: Landmark, b: Landmark, c: Landmark): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const mag = Math.hypot(abx, aby) * Math.hypot(cbx, cby);
  if (mag === 0) return NaN;
  const cos = Math.min(1, Math.max(-1, dot / mag));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function isVisible(lm: Landmark | undefined, min: number): boolean {
  if (!lm) return false;
  if (!Number.isFinite(lm.x) || !Number.isFinite(lm.y)) return false;
  return (lm.visibility ?? 1) >= min;
}

export interface SideTriple {
  a: Landmark;
  b: Landmark;
  c: Landmark;
  score: number;
}

/**
 * Picks the body side (left/right) whose three landmarks are all visible.
 * When both qualify, the one with the higher mean visibility wins.
 */
export function bestSide(
  lm: Landmark[],
  left: [number, number, number],
  right: [number, number, number],
  minVisibility: number,
): SideTriple | null {
  const make = (idx: [number, number, number]): SideTriple | null => {
    const pts = idx.map((i) => lm[i]);
    if (!pts.every((p) => isVisible(p, minVisibility))) return null;
    const score = pts.reduce((s, p) => s + (p!.visibility ?? 1), 0) / 3;
    return { a: pts[0]!, b: pts[1]!, c: pts[2]!, score };
  };
  const l = make(left);
  const r = make(right);
  if (l && r) return l.score >= r.score ? l : r;
  return l ?? r;
}

/** Exponential moving average; first sample passes through unchanged. */
export class Ema {
  private value: number | null = null;
  constructor(private readonly alpha: number) {}
  next(sample: number): number {
    this.value = this.value === null ? sample : this.alpha * sample + (1 - this.alpha) * this.value;
    return this.value;
  }
  reset(): void {
    this.value = null;
  }
}
