"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import { createCounter, type Counter, type ExerciseId, type FrameResult } from "@/lib/exercises";
import { CAMERA_MESSAGE_UZ, CameraError, openCamera, stopStream } from "@/lib/pose/camera";
import { loadPoseLandmarker } from "@/lib/pose/loader";

export type SessionStatus = "idle" | "loading" | "running" | "paused" | "finished" | "error";

export interface Summary {
  exerciseId: ExerciseId;
  reps: number;
  holdSec: number;
  durationSec: number;
  startedAt: string;
}

const EMPTY: FrameResult = { phase: "idle", reps: 0, holdSec: 0, angle: null, visible: false, feedback: "stand_tall" };

export function usePoseSession(exerciseId: ExerciseId) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const counterRef = useRef<Counter | null>(null);
  const rafRef = useRef<number>(0);
  const statusRef = useRef<SessionStatus>("idle");
  const metricsRef = useRef<FrameResult>(EMPTY);
  const elapsedRef = useRef(0);
  const startedAtRef = useRef<string>("");

  const [status, setStatusState] = useState<SessionStatus>("idle");
  const [metrics, setMetrics] = useState<FrameResult>(EMPTY);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const setStatus = useCallback((s: SessionStatus) => {
    statusRef.current = s;
    setStatusState(s);
  }, []);

  const teardown = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    const c = canvasRef.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
  }, []);

  useEffect(() => teardown, [teardown]); // release the camera on unmount

  const loop = useCallback(async () => {
    const vision = await import("@mediapipe/tasks-vision");
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!video || !canvas || !ctx) return;
    const drawing = new vision.DrawingUtils(ctx);
    let lastVideoTime = -1;
    let lastTick = performance.now();
    let lastPush = 0;

    const frame = () => {
      const lm = landmarkerRef.current;
      if (!lm || statusRef.current === "finished" || statusRef.current === "idle") return;
      const now = performance.now();
      const dt = now - lastTick;
      lastTick = now;

      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        if (canvas.width !== video.videoWidth) { canvas.width = video.videoWidth; canvas.height = video.videoHeight; }
        const res = lm.detectForVideo(video, now);
        const pose = res.landmarks[0] ?? null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (pose) {
          drawing.drawConnectors(pose, vision.PoseLandmarker.POSE_CONNECTIONS, { color: "#C6FF4D", lineWidth: 3 });
          drawing.drawLandmarks(pose, { color: "#10120F", fillColor: "#C6FF4D", radius: 3 });
        }
        if (statusRef.current === "running" && counterRef.current) {
          elapsedRef.current += dt;
          const r = counterRef.current.update(pose, now);
          const prev = metricsRef.current;
          metricsRef.current = r;
          if (r.reps !== prev.reps || r.phase !== prev.phase || r.feedback !== prev.feedback || now - lastPush > 200) {
            lastPush = now;
            setMetrics(r);
            setElapsedSec(Math.floor(elapsedRef.current / 1000));
          }
        }
      }
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setSummary(null);
    setStatus("loading");
    try {
      const stream = await openCamera();
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("no video");
      video.srcObject = stream;
      await video.play();
      try {
        landmarkerRef.current = await loadPoseLandmarker();
      } catch {
        teardown();
        setError("Sun’iy intellekt modelini yuklab bo‘lmadi. Internet aloqasini tekshirib, qayta urinib ko‘ring.");
        setStatus("error");
        return;
      }
      counterRef.current = createCounter(exerciseId);
      counterRef.current.reset();
      metricsRef.current = EMPTY;
      elapsedRef.current = 0;
      startedAtRef.current = new Date().toISOString();
      setMetrics(EMPTY);
      setElapsedSec(0);
      setStatus("running");
      void loop();
    } catch (e) {
      teardown();
      setError(e instanceof CameraError ? CAMERA_MESSAGE_UZ[e.code] : CAMERA_MESSAGE_UZ.unknown);
      setStatus("error");
    }
  }, [exerciseId, loop, setStatus, teardown]);

  const pause = useCallback(() => statusRef.current === "running" && setStatus("paused"), [setStatus]);
  const resume = useCallback(() => statusRef.current === "paused" && setStatus("running"), [setStatus]);

  const finish = useCallback(() => {
    const r = metricsRef.current;
    const s: Summary = {
      exerciseId,
      reps: r.reps,
      holdSec: Math.round(r.holdSec),
      durationSec: Math.max(1, Math.round(elapsedRef.current / 1000)),
      startedAt: startedAtRef.current || new Date().toISOString(),
    };
    teardown();
    setSummary(s);
    setStatus("finished");
  }, [exerciseId, setStatus, teardown]);

  const reset = useCallback(() => {
    teardown();
    setSummary(null);
    setError(null);
    setMetrics(EMPTY);
    setElapsedSec(0);
    setStatus("idle");
  }, [setStatus, teardown]);

  return { videoRef, canvasRef, status, metrics, elapsedSec, error, summary, start, pause, resume, finish, reset };
}
