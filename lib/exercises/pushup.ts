import { angleDeg, bestSide } from "./geometry";
import { createCycleCounter, type CycleConfig } from "./cycleCounter";
import { LM, type Counter } from "./types";

export interface PushupConfig extends CycleConfig {
  minVisibility: number;
  /** |dy| / |dx| between shoulder and ankle must be below this (body roughly horizontal). */
  maxBodyTilt: number;
}

export const DEFAULT_PUSHUP_CONFIG: PushupConfig = {
  extendedAngle: 155,
  startAngle: 140,
  bottomAngle: 95,
  hysteresis: 12,
  minRepMs: 600,
  smoothing: 0.5,
  lostResetMs: 1500,
  minVisibility: 0.5,
  maxBodyTilt: 0.6,
};

/** Push-up: elbow angle (shoulder-elbow-wrist), only while the body is roughly horizontal. */
export function createPushupCounter(overrides: Partial<PushupConfig> = {}): Counter {
  const cfg = { ...DEFAULT_PUSHUP_CONFIG, ...overrides };
  return createCycleCounter("pushup", cfg, (lm) => {
    const side = bestSide(
      lm,
      [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST],
      [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
      cfg.minVisibility,
    );
    if (!side) return { kind: "not_visible" };

    const shoulder = side.a;
    const ankle = [lm[LM.LEFT_ANKLE], lm[LM.RIGHT_ANKLE]]
      .filter((p) => p && (p.visibility ?? 1) >= cfg.minVisibility)
      .sort((p, q) => (q!.visibility ?? 1) - (p!.visibility ?? 1))[0];
    if (!ankle) return { kind: "not_visible" };

    const dx = Math.abs(shoulder.x - ankle.x);
    const dy = Math.abs(shoulder.y - ankle.y);
    if (dx === 0 || dy / dx > cfg.maxBodyTilt) return { kind: "position", feedback: "get_in_position" };

    const angle = angleDeg(side.a, side.b, side.c);
    return Number.isFinite(angle) ? { kind: "ok", angle } : { kind: "not_visible" };
  });
}
