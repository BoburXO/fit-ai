export type ExerciseId = "squat" | "pushup" | "plank";

export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type Phase =
  | "idle"
  | "standing"
  | "descending"
  | "bottom"
  | "ascending"
  | "holding"
  | "broken";

export type FeedbackKey =
  | "stand_tall"
  | "slow_down"
  | "finish_move"
  | "check_posture"
  | "good"
  | "not_visible"
  | "get_in_position"
  | "hold";

export interface FrameResult {
  phase: Phase;
  reps: number;
  holdSec: number;
  /** Smoothed primary joint angle in degrees, null when not measurable. */
  angle: number | null;
  /** True when every landmark needed for this exercise is confident enough. */
  visible: boolean;
  feedback: FeedbackKey;
}

export interface Counter {
  readonly id: ExerciseId;
  update(landmarks: Landmark[] | null, tMs: number): FrameResult;
  reset(): void;
}

/** MediaPipe Pose landmark indices. */
export const LM = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;
