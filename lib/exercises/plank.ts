import { Ema, angleDeg, bestSide } from "./geometry";
import { LM, type Counter, type FeedbackKey, type FrameResult, type Phase } from "./types";

export interface PlankConfig {
  minVisibility: number;
  /** Shoulder-hip-ankle angle must be at least this (straight body line). */
  minAlignAngle: number;
  maxBodyTilt: number;
  smoothing: number;
  /** A single frame gap can add at most this much time (protects against pauses). */
  maxFrameGapMs: number;
}

export const DEFAULT_PLANK_CONFIG: PlankConfig = {
  minVisibility: 0.5,
  minAlignAngle: 160,
  maxBodyTilt: 0.6,
  smoothing: 0.4,
  maxFrameGapMs: 500,
};

/** Plank: accumulates hold time only while the body line stays aligned and visible. */
export function createPlankCounter(overrides: Partial<PlankConfig> = {}): Counter {
  const cfg = { ...DEFAULT_PLANK_CONFIG, ...overrides };
  const ema = new Ema(cfg.smoothing);
  let holdMs = 0;
  let lastT: number | null = null;
  let phase: Phase = "idle";
  let lastAngle: number | null = null;

  const out = (visible: boolean, feedback: FeedbackKey): FrameResult => ({
    phase,
    reps: 0,
    holdSec: holdMs / 1000,
    angle: lastAngle,
    visible,
    feedback,
  });

  return {
    id: "plank",
    reset() {
      holdMs = 0;
      lastT = null;
      phase = "idle";
      lastAngle = null;
      ema.reset();
    },
    update(landmarks, tMs) {
      const dt = lastT === null ? 0 : Math.min(Math.max(tMs - lastT, 0), cfg.maxFrameGapMs);
      lastT = tMs;

      if (!landmarks) {
        phase = "broken";
        return out(false, "not_visible");
      }
      const side = bestSide(
        landmarks,
        [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_ANKLE],
        [LM.RIGHT_SHOULDER, LM.RIGHT_HIP, LM.RIGHT_ANKLE],
        cfg.minVisibility,
      );
      if (!side) {
        phase = "broken";
        return out(false, "not_visible");
      }
      const dx = Math.abs(side.a.x - side.c.x);
      const dy = Math.abs(side.a.y - side.c.y);
      if (dx === 0 || dy / dx > cfg.maxBodyTilt) {
        phase = "broken";
        return out(true, "get_in_position");
      }
      const raw = angleDeg(side.a, side.b, side.c);
      if (!Number.isFinite(raw)) {
        phase = "broken";
        return out(false, "not_visible");
      }
      const angle = ema.next(raw);
      lastAngle = angle;
      if (angle < cfg.minAlignAngle) {
        phase = "broken";
        return out(true, "check_posture");
      }
      phase = "holding";
      holdMs += dt;
      return out(true, "hold");
    },
  };
}
