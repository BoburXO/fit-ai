"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Camera, CheckCircle2, FlaskConical, Pause, Play, RotateCcw, ShieldCheck, Square, Trophy } from "lucide-react";
import { useApp } from "@/components/layout/AppProvider";
import { usePoseSession } from "@/hooks/usePoseSession";
import { FEEDBACK_UZ, type ExerciseId, type Phase } from "@/lib/exercises";
import { COMPLETION_RULES } from "@/lib/workouts/validate";
import type { SaveResult } from "@/lib/storage/state";
import { DemoBadge, ErrorState, ProgressBar } from "@/components/ui/primitives";

const EXERCISES: { id: ExerciseId; label: string; target: number; unit: string }[] = [
  { id: "squat", label: "Squat", target: 12, unit: "ta" },
  { id: "pushup", label: "Push-up", target: 10, unit: "ta" },
  { id: "plank", label: "Plank", target: 30, unit: "soniya" },
];
const PHASE_UZ: Record<Phase, string> = {
  idle: "Kutilmoqda", standing: "Tik turish", descending: "Pastga tushish", bottom: "Pastki nuqta",
  ascending: "Yuqoriga ko‘tarilish", holding: "Ushlab turish", broken: "Holat buzildi",
};
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const REASON_UZ: Record<string, string> = {
  not_valid: "Mashq minimal talabga yetmadi, shuning uchun ball berilmadi.",
  daily_limit: "Bugungi ball beriladigan mashqlar limiti to‘ldi.",
  duplicate: "Bu mashq allaqachon saqlangan.",
};

export function CoachStudio() {
  const params = useSearchParams();
  const initial = (params.get("exercise") as ExerciseId | null) ?? "squat";
  const [exerciseId, setExerciseId] = useState<ExerciseId>(EXERCISES.some((e) => e.id === initial) ? initial : "squat");
  const [saved, setSaved] = useState<SaveResult | null>(null);
  const { saveWorkout, toast } = useApp();
  const s = usePoseSession(exerciseId);
  const ex = EXERCISES.find((e) => e.id === exerciseId)!;
  const active = s.status === "running" || s.status === "paused";
  const value = exerciseId === "plank" ? Math.round(s.metrics.holdSec) : s.metrics.reps;
  const percent = Math.min(100, Math.round((value / ex.target) * 100));
  const rule = COMPLETION_RULES[exerciseId];

  const save = (source: "camera" | "demo") => {
    const sum = s.summary;
    const input = source === "camera" && sum
      ? { exerciseId, reps: sum.reps, holdSec: sum.holdSec, durationSec: sum.durationSec, startedAt: sum.startedAt, source }
      : { exerciseId, reps: exerciseId === "plank" ? 0 : 12, holdSec: exerciseId === "plank" ? 30 : 0, durationSec: 60, startedAt: new Date().toISOString(), source };
    const res = saveWorkout(input);
    if (res) { setSaved(res); toast(source === "demo" ? "Demo yozuv saqlandi (ball berilmaydi)." : "Mashq saqlandi."); }
  };

  const newSession = () => { setSaved(null); s.reset(); };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section aria-label="Kamera paneli" className="grid gap-3">
        <div className="card relative aspect-video overflow-hidden bg-black">
          {/* Mirrored for natural feel; landmarks are drawn on a canvas mirrored the same way. */}
          <video ref={s.videoRef} playsInline muted className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />
          <canvas ref={s.canvasRef} className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100 object-cover" />
          {!active && s.status !== "loading" && (
            <div className="absolute inset-0 grid place-items-center bg-ink/80 p-6 text-center">
              <div>
                <Camera className="mx-auto text-lime" size={36} aria-hidden />
                <p className="mt-3 font-bold">{s.status === "finished" ? "Mashq yakunlandi" : "Kamera o‘chiq"}</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-mute">Kamera faqat “Boshlash” tugmasini bossangiz yoqiladi. Video hech qayerga yuklanmaydi va saqlanmaydi.</p>
              </div>
            </div>
          )}
          {s.status === "loading" && (
            <div className="absolute inset-0 grid place-items-center bg-ink/80 text-center" aria-busy="true">
              <div><div className="skeleton mx-auto h-2 w-40 rounded-full" /><p className="mt-3 text-sm text-mute">Kamera va sun’iy intellekt modeli yuklanmoqda…</p></div>
            </div>
          )}
          {active && (
            <div className="absolute inset-x-3 bottom-3 rounded-xl bg-ink/85 px-4 py-3 text-center text-lg font-bold" aria-live="polite">
              {FEEDBACK_UZ[s.metrics.feedback]}
            </div>
          )}
          {s.status === "paused" && <div className="absolute left-3 top-3 rounded-md bg-amber-300 px-2 py-1 text-xs font-bold text-ink">Pauza</div>}
        </div>

        {s.error && (
          <div className="grid gap-3">
            <ErrorState title="Kamerani ishga tushirib bo‘lmadi" text={s.error} action={<button className="btn-ghost" onClick={s.reset}>Qayta urinish</button>} />
            <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="text-sm"><DemoBadge>Demo rejim</DemoBadge><p className="mt-2 max-w-md text-mute">Kamerasiz taqdimot uchun namuna yozuv saqlash mumkin. Bu <b className="text-white">haqiqiy AI aniqlash emas</b> va ball bermaydi.</p></div>
              <button className="btn-ghost" onClick={() => save("demo")}><FlaskConical size={16} aria-hidden /> Namuna yozuv saqlash</button>
            </div>
          </div>
        )}

        <p className="text-xs text-mute">Natija kamera burchagi, yorug‘lik, kiyim va tananing ko‘rinishiga bog‘liq. Bu tibbiy o‘lchov emas. Kamerani yon tomondan, butun tana ko‘rinadigan qilib qo‘ying.</p>
      </section>

      <aside className="grid content-start gap-4">
        <div className="card p-4">
          <div role="radiogroup" aria-label="Mashq turi" className="grid grid-cols-3 gap-2">
            {EXERCISES.map((e) => (
              <button key={e.id} role="radio" aria-checked={e.id === exerciseId} disabled={active || s.status === "loading"}
                onClick={() => setExerciseId(e.id)}
                className={`rounded-xl border px-2 py-2 text-sm font-semibold disabled:opacity-50 ${e.id === exerciseId ? "border-lime bg-lime/10 text-lime" : "border-line text-mute hover:text-white"}`}>
                {e.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-ink p-3">
              <div className="text-xs text-mute">{exerciseId === "plank" ? "Ushlab turish" : "Takrorlash"}</div>
              <div className="text-5xl font-extrabold text-lime" aria-live="off">{exerciseId === "plank" ? `${Math.round(s.metrics.holdSec)}s` : s.metrics.reps}</div>
            </div>
            <div className="rounded-xl bg-ink p-3">
              <div className="text-xs text-mute">Vaqt</div>
              <div className="text-4xl font-extrabold">{fmt(s.elapsedSec)}</div>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm"><span className="text-mute">Holat</span><span className="font-semibold">{PHASE_UZ[s.metrics.phase]}</span></div>
          <div className="mt-3"><div className="mb-1 flex justify-between text-xs text-mute"><span>Maqsad: {ex.target} {ex.unit}</span><span>{percent}%</span></div><ProgressBar percent={percent} /></div>
          <p className="mt-3 text-xs text-mute">Ball uchun minimal: {rule.minReps ? `${rule.minReps} ta takror` : `${rule.minHoldSec} soniya`}.</p>

          <div className="mt-5 grid gap-2">
            {(s.status === "idle" || s.status === "error") && <button className="btn-primary" onClick={s.start}><Camera size={16} aria-hidden /> Kamerani yoqish va boshlash</button>}
            {s.status === "running" && <button className="btn-ghost" onClick={s.pause}><Pause size={16} aria-hidden /> Pauza</button>}
            {s.status === "paused" && <button className="btn-primary" onClick={s.resume}><Play size={16} aria-hidden /> Davom ettirish</button>}
            {active && <button className="btn-danger" onClick={s.finish}><Square size={16} aria-hidden /> Yakunlash</button>}
          </div>
        </div>

        {s.status === "finished" && s.summary && (
          <div className="card p-4">
            {!saved ? (
              <>
                <h2 className="flex items-center gap-2 font-bold"><CheckCircle2 className="text-lime" size={18} aria-hidden /> Mashq xulosasi</h2>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                  <div><dt className="text-mute">Takror</dt><dd className="text-xl font-extrabold">{s.summary.reps}</dd></div>
                  <div><dt className="text-mute">Ushlash</dt><dd className="text-xl font-extrabold">{s.summary.holdSec}s</dd></div>
                  <div><dt className="text-mute">Vaqt</dt><dd className="text-xl font-extrabold">{fmt(s.summary.durationSec)}</dd></div>
                </dl>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button className="btn-primary" onClick={() => save("camera")}>Saqlash</button>
                  <button className="btn-ghost" onClick={newSession}><RotateCcw size={16} aria-hidden /> Bekor qilish</button>
                </div>
              </>
            ) : (
              <>
                <h2 className="flex items-center gap-2 font-bold"><Trophy className="text-lime" size={18} aria-hidden /> Saqlandi</h2>
                {saved.award.workout.points > 0 ? (
                  <p className="mt-2 text-sm">Siz <b className="text-lime">+{saved.award.workout.points} ball</b> oldingiz{saved.completedChallenges.length > 0 && <>, shu bilan birga “{saved.completedChallenges.map((c) => c.title).join(", ")}” challenge’i yakunlandi (+{saved.completedChallenges.reduce((a, c) => a + c.rewardPoints, 0)} ball)</>}.</p>
                ) : (
                  <p className="mt-2 text-sm text-mute">{REASON_UZ[saved.award.reason] ?? "Ball berilmadi."}</p>
                )}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link href="/leaderboard" className="btn-primary">Reytingni ko‘rish</Link>
                  <button className="btn-ghost" onClick={newSession}>Yangi mashq</button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="card flex gap-3 p-4 text-xs text-mute"><ShieldCheck size={18} className="shrink-0 text-lime" aria-hidden /> Tasvir qurilmangizda qayta ishlanadi. Kamera “Yakunlash” bosilganda yoki sahifadan chiqqaningizda o‘chiriladi (pauzada yoniq qoladi).</div>
      </aside>
    </div>
  );
}
