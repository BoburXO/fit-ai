"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { CATEGORY_LABEL, EXERCISES, type Category } from "@/lib/exercises/library";
import { EmptyState, PageHeader } from "@/components/ui/primitives";

const DIFF_UZ = { beginner: "Boshlang‘ich", intermediate: "O‘rta", advanced: "Yuqori" } as const;

export default function ExercisesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const list = useMemo(() => EXERCISES.filter((e) => (cat === "all" || e.categories.includes(cat)) && `${e.name} ${e.muscles} ${e.description}`.toLowerCase().includes(q.trim().toLowerCase())), [q, cat]);

  return (
    <>
      <PageHeader title="Mashqlar kutubxonasi" subtitle="Qidiring, toifa bo‘yicha saralang va mashq qo‘llanmasini o‘qing." />
      <div className="mb-4 grid gap-3 md:flex md:items-center">
        <div className="relative md:w-80"><Search size={16} className="absolute left-3 top-3 text-mute" aria-hidden /><input className="input pl-9" placeholder="Mashq qidirish" aria-label="Mashq qidirish" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Toifalar">
          {(["all", ...Object.keys(CATEGORY_LABEL)] as (Category | "all")[]).map((c) => (
            <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${cat === c ? "border-lime bg-lime text-ink" : "border-line text-mute hover:text-white"}`}>{c === "all" ? "Hammasi" : CATEGORY_LABEL[c]}</button>
          ))}
        </div>
      </div>
      {list.length === 0 ? <EmptyState icon={SearchX} title="Hech narsa topilmadi" text="Qidiruv so‘zini o‘zgartiring yoki toifani tozalang." /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((e) => (
            <article key={e.id} className="card p-4">
              <div className="flex items-start justify-between gap-2"><h2 className="font-bold">{e.name}</h2><span className="shrink-0 rounded-md border border-line px-2 py-0.5 text-xs text-mute">{DIFF_UZ[e.difficulty]}</span></div>
              <p className="mt-1 text-sm text-mute">{e.description}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm"><div><dt className="text-mute">Mushaklar</dt><dd>{e.muscles}</dd></div><div><dt className="text-mute">Tavsiya</dt><dd>{e.reps ? `${e.reps} ta takror` : `${e.holdSec} soniya`}</dd></div></dl>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-ghost !py-1.5" aria-expanded={open === e.id} onClick={() => setOpen(open === e.id ? null : e.id)}>{open === e.id ? "Yopish" : "Qo‘llanma"}</button>
                {e.trackable ? <Link href={`/workout?exercise=${e.trackable}`} className="btn-primary !py-1.5">Mashqni boshlash</Link> : <span className="self-center text-xs text-mute">Kamera sanog‘i hozircha yo‘q</span>}
              </div>
              {open === e.id && (
                <div className="mt-4 grid gap-3 border-t border-line pt-3 text-sm">
                  <ol className="list-decimal space-y-1 pl-5">{e.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                  <div><div className="font-semibold">Xavfsizlik</div><ul className="list-disc space-y-1 pl-5 text-mute">{e.safety.map((s) => <li key={s}>{s}</li>)}</ul></div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
