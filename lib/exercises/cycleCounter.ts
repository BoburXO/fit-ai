import { Ema } from "./geometry";
import type { Counter, ExerciseId, FeedbackKey, FrameResult, Landmark, Phase } from "./types";

export interface CycleConfig {
  /** Angle at or above which the body counts as fully extended. */
  extendedAngle: number;
  /** Angle at or below which the movement counts as deep enough. */
  bottomAngle: number;
  /** Angle below which a descent is considered started. */
  startAngle: number;
  /** Rep cycles faster than this are treated as noise. */
  minRepMs: number;
  /** Angle must rise by this much above bottomAngle to count as ascending. */
  hysteresis: number;
  /** Smoothing factor 0..1 (higher = more responsive, noisier). */
  smoothing: number;
  /** Continuous loss longer than this resets the state machine. */
  lostResetMs: number;
}

export type Measure =
  | { kind: "ok"; angle: number }
  | { kind: "not_visible" }
  | { kind: "position"; feedback: FeedbackKey };

/**
 * Generic extension -> flexion -> extension rep counter used by squats and push-ups.
 * A rep is counted only when the cycle reached the bottom threshold AND returned to full
 * extension AND took at least minRepMs. It never counts twice for the same cycle.
 */
export function createCycleCounter(
  id: ExerciseId,
  cfg: CycleConfig,
  measure: (lm: Landmark[]) => Measure,
): Counter {
  const ema = new Ema(cfg.smoothing);
  let phase: Phase = "idle";
  let reps = 0;
  let reachedBottom = false;
  let cycleStart = 0;
  let lostSince: number | null = null;
  let lastAngle: number | null = null;

  const result = (visible: boolean, feedback: FeedbackKey): FrameResult => ({
    phase,
    reps,
    holdSec: 0,
    angle: lastAngle,
    visible,
    feedback,
  });

  const resetCycle = () => {
    reachedBottom = false;
    ema.reset();
  };

  return {
    id,
    reset() {
      phase = "idle";
      reps = 0;
      lastAngle = null;
      lostSince = null;
      resetCycle();
    },
    update(landmarks, tMs) {
      const m: Measure = landmarks ? measure(landmarks) : { kind: "not_visible" };

      if (m.kind !== "ok") {
        if (lostSince === null) lostSince = tMs;
        if (tMs - lostSince > cfg.lostResetMs && phase !== "idle") {
          phase = "idle";
          resetCycle();
        }
        return result(m.kind === "position", m.kind === "position" ? m.feedback : "not_visible");
      }
      lostSince = null;

      const angle = ema.next(m.angle);
      lastAngle = angle;
      let feedback: FeedbackKey = "stand_tall";

      switch (phase) {
        case "idle":
          if (angle >= cfg.extendedAngle) {
            phase = "standing";
            feedback = "good";
          }
          break;
        case "standing":
          feedback = "good";
          if (angle < cfg.startAngle) {
            phase = "descending";
            reachedBottom = false;
            cycleStart = tMs;
          }
          break;
        case "descending":
          feedback = "slow_down";
          if (angle <= cfg.bottomAngle) {
            phase = "bottom";
            reachedBottom = true;
          } else if (angle >= cfg.extendedAngle) {
            // Came back up without reaching depth: not a valid rep.
            phase = "standing";
            feedback = "finish_move";
          }
          break;
        case "bottom":
          feedback = "good";
          if (angle > cfg.bottomAngle + cfg.hysteresis) phase = "ascending";
          break;
        case "ascending":
          feedback = "good";
          if (angle <= cfg.bottomAngle) {
            phase = "bottom";
          } else if (angle >= cfg.extendedAngle) {
            phase = "standing";
            if (reachedBottom && tMs - cycleStart >= cfg.minRepMs) reps += 1;
            else feedback = "finish_move";
            reachedBottom = false;
          }
          break;
        default:
          phase = "idle";
      }
      return result(true, feedback);
    },
  };
}
