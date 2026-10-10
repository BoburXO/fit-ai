"use client";

import { useState } from "react";
import { CalendarCheck, RefreshCw } from "lucide-react";
import { useApp } from "@/components/layout/AppProvider";
import { CATEGORY_LABEL, byId, type Category } from "@/lib/exercises/library";
import { generatePlan, planProgress, type PlanPrefs } from "@/lib/workouts/plan";
import { EmptyState, PageHeader, ProgressBar } from "@/components/ui/primitives";

export default function PlanPage() {
  const { state, setPlan } = useApp();
  const [prefs, setPrefs] = useState<PlanPrefs>(state.plan?.prefs ?? { level: state.profile.level, goal: state.profile.goal, minutesPerDay: 15, categories: ["beginner"], restDays: 2 });
  const plan = state.plan;
  const prog = plan ? planProgress(plan) : null;
  const toggleCat = (c: Category) => setPrefs((p) => ({ ...p, categories: p.categories.includes(c) ? p.categories.filter((x) => x !== c) : [...p.categories, c] }));
  const generate = () => setPlan(generatePlan(prefs, new Date().toISOString()));

  return (
    <>
      <PageHeader title="Kunlik mashq rejasi" subtitle="Reja oddiy, shaffof qoidalar asosida tuziladi (o‘qitilgan AI model emas). Umumiy sog‘lomlashtirish uchun, tibbiy maslahat emas." />
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <form className="card grid content-start gap-4 p-4" onSubmit={(e) => { e.preventDefault(); generate(); }}>
          <div><label className="label" htmlFor="lvl">Daraja</label>
            <select id="lvl" className="input" value={prefs.level} onChange={(e) => setPrefs({ ...prefs, level: e.target.value as PlanPrefs["level"] })}><option value="beginner">Boshlovchi</option><option value="intermediate">O‘rta</option><option value="advanced">Yuqori</option></select></div>
          <div><label className="label" htmlFor="goal">Maqsad</label>
            <select id="goal" className="input" value={prefs.goal} onChange={(e) => setPrefs({ ...prefs, goal: e.target.value as PlanPrefs["goal"] })}><option value="active">Faol bo‘lib qolish</option><option value="strength">Kuch oshirish</option><option value="endurance">Chidamlilikni oshirish</option></select></div>
          <div><label className="label" htmlFor="min">Kunlik vaqt: {prefs.minutesPerDay} daqiqa</label>
            <input id="min" type="range" min={5} max={60} step={5} value={prefs.minutesPerDay} onChange={(e) => setPrefs({ ...prefs, minutesPerDay: Number(e.target.value) })} className="w-full accent-[#C6FF4D]" /></div>
          <div><label className="label" htmlFor="rest">Dam kunlari: {prefs.restDays}</label>
            <input id="rest" type="range" min={0} max={3} value={prefs.restDays} onChange={(e) => setPrefs({ ...prefs, restDays: Number(e.target.value) })} className="w-full accent-[#C6FF4D]" /></div>
          <fieldset><legend className="label">Mashq turlari</legend><div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (<button type="button" key={c} aria-pressed={prefs.categories.includes(c)} onClick={() => toggleCat(c)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${prefs.categories.includes(c) ? "border-lime bg-lime text-ink" : "border-line text-mute"}`}>{CATEGORY_LABEL[c]}</button>))}</div></fieldset>
          <button className="btn-primary" type="submit">{plan ? <><RefreshCw size={16} aria-hidden /> Qayta yaratish</> : "Reja yaratish"}</button>
        </form>

        {!plan || !prog ? <EmptyState icon={CalendarCheck} title="Reja hali yo‘q" text="Chapdagi parametrlarni tanlab, “Reja yaratish” tugmasini bosing." /> : (
          <div className="grid gap-3">
            <div className="card p-4"><div className="mb-2 flex justify-between text-sm"><span className="font-bold">Haftalik bajarilish</span><span className="text-mute">{prog.done}/{prog.total}</span></div><ProgressBar percent={prog.percent} /><p className="mt-2 text-xs text-mute">Belgilar o‘zingiz kiritgan ma’lumot; ball faqat kamera mashqlari uchun beriladi.</p></div>
            {plan.days.map((d, di) => (
              <div key={d.label} className="card p-4">
                <div className="flex items-center justify-between"><h2 className="font-bold">{d.label}</h2>
                  <button className="text-sm text-mute underline" onClick={() => setPlan({ ...plan, days: plan.days.map((x, i) => i === di ? (x.rest ? { ...x, rest: false } : { ...x, rest: true, items: [], minutes: 0 }) : x) })}>{d.rest ? "Dam kunini olib tashlash" : "Dam kuni qilish"}</button></div>
                {d.rest ? <p className="mt-2 text-sm text-mute">Dam kuni. Tanangiz tiklansin.</p> : (
                  <>
                    <p className="text-xs text-mute">Taxminan {d.minutes} daqiqa</p>
                    <ul className="mt-2 grid gap-2">{d.items.map((it, ii) => { const ex = byId(it.exerciseId); return (
                      <li key={it.exerciseId + ii}><label className="flex cursor-pointer items-center gap-3 text-sm">
                        <input type="checkbox" className="h-4 w-4 accent-[#C6FF4D]" checked={it.done} onChange={() => setPlan({ ...plan, days: plan.days.map((x, i) => i === di ? { ...x, items: x.items.map((y, j) => j === ii ? { ...y, done: !y.done } : y) } : x) })} />
                        <span className={it.done ? "text-mute line-through" : ""}>{ex?.name ?? it.exerciseId} — {it.sets} × {it.reps ? `${it.reps} ta` : `${it.holdSec} soniya`}</span></label></li>); })}</ul>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
