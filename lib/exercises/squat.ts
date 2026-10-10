import { angleDeg, bestSide } from "./geometry";
import { createCycleCounter, type CycleConfig } from "./cycleCounter";
import { LM, type Counter } from "./types";

export interface SquatConfig extends CycleConfig {
  minVisibility: number;
}

export const DEFAULT_SQUAT_CONFIG: SquatConfig = {
  extendedAngle: 160,
  startAngle: 150,
  bottomAngle: 105,
  hysteresis: 10,
  minRepMs: 700,
  smoothing: 0.5,
  lostResetMs: 1500,
  minVisibility: 0.5,
};

/** Squat: knee angle (hip-knee-ankle) on the most visible body side. */
export function createSquatCounter(overrides: Partial<SquatConfig> = {}): Counter {
  const cfg = { ...DEFAULT_SQUAT_CONFIG, ...overrides };
  return createCycleCounter("squat", cfg, (lm) => {
    const side = bestSide(
      lm,
      [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE],
      [LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
      cfg.minVisibility,
    );
    if (!side) return { kind: "not_visible" };
    const angle = angleDeg(side.a, side.b, side.c);
    return Number.isFinite(angle) ? { kind: "ok", angle } : { kind: "not_visible" };
  });
}
