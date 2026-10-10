"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { History as HistoryIcon, Medal } from "lucide-react";
import { useApp } from "@/components/layout/AppProvider";
import { ActivityChart } from "@/components/charts/ActivityChart";
import { DemoBadge, EmptyState, PageHeader } from "@/components/ui/primitives";
import { byId } from "@/lib/exercises/library";
import { dayKey } from "@/lib/workouts/dates";
import { lastNDays, personalRecords } from "@/lib/workouts/stats";

export default function HistoryPage() {
  const { state, now } = useApp();
  const [ex, setEx] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const list = useMemo(() => state.workouts.filter((w) => (ex === "all" || w.exerciseId === ex) && (!from || dayKey(w.startedAt) >= from) && (!to || dayKey(w.startedAt) <= to)), [state.workouts, ex, from, to]);
  const pr = personalRecords(state.workouts);
  const fmt = (iso: string) => new Date(iso).toLocaleString("uz-UZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <PageHeader title="Mashqlar tarixi" subtitle="Barcha saqlangan mashqlar va rivojlanishingiz." />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4"><h2 className="mb-2 font-bold">Haftalik (daqiqa)</h2><ActivityChart data={lastNDays(state.workouts, now, 7)} label="Haftalik faollik" /></div>
        <div className="card p-4"><h2 className="mb-2 font-bold">Oylik (daqiqa)</h2><ActivityChart data={lastNDays(state.workouts, now, 30)} label="Oylik faollik" /></div>
      </div>
      <div className="card mt-4 p-4"><h2 className="flex items-center gap-2 font-bold"><Medal size={16} className="text-lime" aria-hidden /> Shaxsiy rekordlar</h2>
        {pr.squatReps + pr.pushupReps + pr.plankSec === 0 ? <p className="mt-2 text-sm text-mute">Rekordlar faqat kamera orqali o‘lchangan mashqlardan hisoblanadi. Hozircha yo‘q.</p> : (
          <dl className="mt-2 grid grid-cols-3 gap-3 text-center text-sm"><div><dt className="text-mute">Squat</dt><dd className="text-2xl font-extrabold">{pr.squatReps}</dd></div><div><dt className="text-mute">Push-up</dt><dd className="text-2xl font-extrabold">{pr.pushupReps}</dd></div><div><dt className="text-mute">Plank</dt><dd className="text-2xl font-extrabold">{pr.plankSec}s</dd></div></dl>)}
      </div>

      <div className="mb-3 mt-6 flex flex-wrap gap-3">
        <div><label className="label" htmlFor="ex">Mashq</label><select id="ex" className="input" value={ex} onChange={(e) => setEx(e.target.value)}><option value="all">Hammasi</option><option value="squat">Squat</option><option value="pushup">Push-up</option><option value="plank">Plank</option></select></div>
        <div><label className="label" htmlFor="f">Dan</label><input id="f" type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="label" htmlFor="t">Gacha</label><input id="t" type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
      </div>
      {list.length === 0 ? <EmptyState icon={HistoryIcon} title="Mashq topilmadi" text="Filtrni o‘zgartiring yoki yangi mashq boshlang." action={<Link href="/workout" className="btn-primary">AI mashq</Link>} /> : (
        <ul className="grid gap-2">{list.map((w) => (
          <li key={w.id} className="card p-4">
            <button className="flex w-full flex-wrap items-center justify-between gap-2 text-left" aria-expanded={open === w.id} onClick={() => setOpen(open === w.id ? null : w.id)}>
              <span className="font-semibold">{byId(w.exerciseId)?.name ?? w.exerciseId} {w.source === "demo" && <DemoBadge>Namuna</DemoBadge>}</span>
              <span className="text-sm text-mute">{fmt(w.startedAt)} · {w.exerciseId === "plank" ? `${w.holdSec}s` : `${w.reps} ta`} · {Math.round(w.durationSec / 60 * 10) / 10} daq · {w.points > 0 ? `+${w.points} ball` : "ball yo‘q"} · {w.completed ? "yakunlangan" : "yakunlanmagan"}</span>
            </button>
            {open === w.id && <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-sm md:grid-cols-4"><div><dt className="text-mute">Manba</dt><dd>{w.source === "camera" ? "Kamera (o‘lchangan)" : "Namuna"}</dd></div><div><dt className="text-mute">Davomiyligi</dt><dd>{w.durationSec} soniya</dd></div><div><dt className="text-mute">Takror / ushlash</dt><dd>{w.reps} / {w.holdSec}s</dd></div><div><dt className="text-mute">Ball</dt><dd>{w.points}</dd></div></dl>}
          </li>))}</ul>
      )}
    </>
  );
}
