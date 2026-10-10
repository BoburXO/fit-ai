import type { PoseLandmarker } from "@mediapipe/tasks-vision";

const VERSION = "0.10.21"; // keep in sync with package.json
const WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`;
const MODEL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

/**
 * Loads MediaPipe only when a workout starts (dynamic import keeps it out of the main bundle).
 * Needs internet for the wasm + model files; self-host them under /public for offline use.
 */
export async function loadPoseLandmarker(): Promise<PoseLandmarker> {
  const vision = await import("@mediapipe/tasks-vision");
  const fileset = await vision.FilesetResolver.forVisionTasks(WASM);
  const make = (delegate: "GPU" | "CPU") =>
    vision.PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL, delegate },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  try {
    return await make("GPU");
  } catch {
    return await make("CPU");
  }
}
