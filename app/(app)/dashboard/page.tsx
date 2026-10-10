"use client";

import Link from "next/link";
import { Activity, Bell, CalendarDays, Droplets, Flame, FlaskConical, Footprints, Timer, Trophy } from "lucide-react";
import { useApp } from "@/components/layout/AppProvider";
import { useBoard } from "@/hooks/useBoard";
import { ActivityChart } from "@/components/charts/ActivityChart";
import { MetricCard, PageHeader, ProgressBar, ProgressRing, EmptyState, DemoBadge } from "@/components/ui/primitives";
import { challengeProgress } from "@/lib/storage/state";
import { challengeStatus } from "@/lib/challenges/progress";
import { currentStreak, lastNDays, minutesOnDay, totals } from "@/lib/workouts/stats";
import { dayKey } from "@/lib/workouts/dates";
import { byId } from "@/lib/exercises/library";

export default function DashboardPage() {
  const { state, now, addWater, clearSamples } = useApp();
  const { teams } = useBoard("week");
  const t = totals(state.workouts);
  const today = dayKey(now);
  const todayMin = minutesOnDay(state.workouts, today);
  const goalPct = Math.min(100, Math.round((todayMin / state.profile.dailyGoalMin) * 100));
  const water = state.water[today] ?? 0;
  const waterPct = Math.min(100, Math.round((water / state.profile.waterTargetMl) * 100));
  const myTeam = teams.find((x) => x.teamId === state.profile.teamId);
  const active = state.challenges.filter((c) => state.joined[c.id] && challengeStatus(c, now) === "active");
  const workedToday = state.workouts.some((w) => w.completed && dayKey(w.startedAt) === today);

  return (
    <>
      <PageHeader title="Bosh sahifa" subtitle="Bugungi faolliging va jamoa natijalari." action={<Link href="/workout" className="btn-primary"><Activity size={16} aria-hidden /> AI mashqni boshlash</Link>} />

      {state.profile.reminderEnabled && !workedToday && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3 text-sm"><Bell size={16} className="text-lime" aria-hidden /> Bugun hali mashq qilmadingiz. Qisqa mashq ham foydali.</div>
      )}
      {state.hasSampleData && t.sample > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/30 bg-amber-300/5 px-4 py-3 text-sm">
          <span className="flex items-center gap-2"><FlaskConical size={16} className="text-amber-200" aria-hidden /> Statistikaga {t.sample} ta <b>namuna</b> yozuv kiradi. Ular kamera orqali o‘lchanmagan va ball bermaydi.</span>
          <button className="btn-ghost !py-1.5" onClick={clearSamples}>Namunalarni o‘chirish</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard icon={Activity} label="Jami mashqlar" value={t.workouts} hint={t.sample ? `shundan ${t.sample} ta namuna` : undefined} />
        <MetricCard icon={Timer} label="Faol daqiqalar" value={t.minutes} />
        <MetricCard icon={Footprints} label="Takrorlar" value={t.reps} />
        <MetricCard icon={Flame} label="Ketma-ket kunlar" value={currentStreak(state.workouts, now)} hint="kun" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <h2 className="mb-2 font-bold">Haftalik faollik (daqiqa)</h2>
          <ActivityChart data={lastNDays(state.workouts, now, 7)} label="Oxirgi 7 kunlik faollik grafigi" />
        </div>
        <div className="card flex items-center gap-4 p-4">
          <ProgressRing percent={goalPct} label="Kunlik maqsad" />
          <div className="text-sm"><div className="font-bold">Kunlik maqsad</div><div className="text-mute">{todayMin} / {state.profile.dailyGoalMin} daqiqa</div></div>
        </div>

        <div className="card p-4">
          <h2 className="flex items-center gap-2 font-bold"><Droplets size={16} className="text-lime" aria-hidden /> Suv</h2>
          <div className="mt-2 text-sm text-mute">{water} / {state.profile.waterTargetMl} ml</div>
          <div className="mt-2"><ProgressBar percent={waterPct} /></div>
          <div className="mt-3 flex gap-2"><button className="btn-ghost !py-1.5" onClick={() => addWater(250)}>+250 ml</button><button className="btn-ghost !py-1.5" onClick={() => addWater(-250)} disabled={water === 0}>−250</button></div>
          <p className="mt-2 text-xs text-mute">Maqsadni bajarmaslik uchun jazo yo‘q.</p>
        </div>

        <div className="card p-4">
          <h2 className="flex items-center gap-2 font-bold"><Trophy size={16} className="text-lime" aria-hidden /> Jamoa reytingi</h2>
          {myTeam ? (
            <div className="mt-2"><div className="text-3xl font-extrabold">{myTeam.rank}-o‘rin</div><div className="text-sm text-mute">Jamoa {myTeam.name} · {myTeam.points} ball (hafta)</div></div>
          ) : <p className="mt-2 text-sm text-mute">Jamoaga qo‘shiling.</p>}
          <Link href="/leaderboard" className="btn-ghost mt-3 !py-1.5">Reytingni ochish</Link>
          <div className="mt-2"><DemoBadge>Sinfdoshlar demo</DemoBadge></div>
        </div>

        <div className="card p-4">
          <h2 className="flex items-center gap-2 font-bold"><CalendarDays size={16} className="text-lime" aria-hidden /> Faol challenge’lar</h2>
          {active.length === 0 ? <p className="mt-2 text-sm text-mute">Hali qo‘shilmagansiz.</p> : (
            <ul className="mt-3 grid gap-3">{active.slice(0, 3).map((c) => { const p = challengeProgress(state, c)!; return (
              <li key={c.id} className="text-sm"><div className="flex justify-between"><span className="font-semibold">{c.title}</span><span className="text-mute">{p.current}/{p.target}</span></div><div className="mt-1"><ProgressBar percent={p.percent} /></div></li>); })}</ul>
          )}
          <Link href="/challenges" className="btn-ghost mt-3 !py-1.5">Hammasi</Link>
        </div>

        <div className="card p-4 lg:col-span-3">
          <h2 className="mb-3 font-bold">So‘nggi mashqlar</h2>
          {state.workouts.length === 0 ? <EmptyState icon={Activity} title="Hali mashq yo‘q" text="Birinchi AI mashqingizni boshlang." action={<Link href="/workout" className="btn-primary">Boshlash</Link>} /> : (
            <ul className="divide-y divide-line">{state.workouts.slice(0, 5).map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="font-semibold">{byId(w.exerciseId)?.name ?? w.exerciseId} {w.source === "demo" && <DemoBadge>Namuna</DemoBadge>}</span>
                <span className="text-mute">{w.exerciseId === "plank" ? `${w.holdSec}s` : `${w.reps} ta`} · {w.points > 0 ? `+${w.points} ball` : "ball yo‘q"}</span>
              </li>))}</ul>
          )}
        </div>
      </div>
    </>
  );
}
