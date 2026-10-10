"use client";

import { RotateCcw, ShieldAlert } from "lucide-react";
import { useApp } from "@/components/layout/AppProvider";
import { TEAMS } from "@/lib/storage/state";
import { DemoBadge, PageHeader } from "@/components/ui/primitives";

export default function ProfilePage() {
  const { state, setProfile, setTeam, resetDemo, toast } = useApp();
  const p = state.profile;
  const num = (v: string, min: number, max: number, fallback: number) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback; };

  return (
    <>
      <PageHeader title="Profil" subtitle="Sozlamalar shu brauzerda saqlanadi." />
      <div className="mb-4 flex gap-3 rounded-xl border border-amber-300/30 bg-amber-300/5 p-4 text-sm"><ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-200" aria-hidden />
        <p><b>Demo kirish rejimi.</b> Haqiqiy hisob (parol, sessiya) ulanmagan. Ma’lumotlar faqat localStorage’da turadi va xavfsiz autentifikatsiya hisoblanmaydi. Ishlab chiqarishda Auth.js + PostgreSQL ulanadi.</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card grid content-start gap-4 p-4"><h2 className="font-bold">Shaxsiy ma’lumotlar</h2>
          <div><label className="label" htmlFor="nm">Ism</label><input id="nm" className="input" maxLength={60} value={p.name} onChange={(e) => setProfile({ name: e.target.value })} /></div>
          <div><label className="label" htmlFor="lv">Fitness darajasi</label><select id="lv" className="input" value={p.level} onChange={(e) => setProfile({ level: e.target.value as typeof p.level })}><option value="beginner">Boshlovchi</option><option value="intermediate">O‘rta</option><option value="advanced">Yuqori</option></select></div>
          <div><label className="label" htmlFor="gl">Maqsad</label><select id="gl" className="input" value={p.goal} onChange={(e) => setProfile({ goal: e.target.value as typeof p.goal })}><option value="active">Faol bo‘lib qolish</option><option value="strength">Kuch oshirish</option><option value="endurance">Chidamlilik</option></select></div>
          <div><label className="label" htmlFor="tm">Jamoa</label><div className="flex gap-2"><select id="tm" className="input" value={p.teamId ?? ""} onChange={(e) => setTeam(e.target.value || null)}><option value="">Jamoasiz</option>{TEAMS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            <p className="mt-1 text-xs text-mute">Jamoani almashtirsangiz, eski ballar eski jamoada qoladi, yangilari yangi jamoaga yoziladi.</p></div>
        </section>
        <section className="card grid content-start gap-4 p-4"><h2 className="font-bold">Maqsadlar</h2>
          <div><label className="label" htmlFor="dg">Kunlik harakat maqsadi (daqiqa)</label><input id="dg" type="number" className="input" min={1} max={300} value={p.dailyGoalMin} onChange={(e) => setProfile({ dailyGoalMin: num(e.target.value, 1, 300, p.dailyGoalMin) })} /></div>
          <div><label className="label" htmlFor="wt">Kunlik suv maqsadi (ml)</label><input id="wt" type="number" className="input" min={250} max={10000} step={250} value={p.waterTargetMl} onChange={(e) => setProfile({ waterTargetMl: num(e.target.value, 250, 10000, p.waterTargetMl) })} /></div>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-[#C6FF4D]" checked={p.reminderEnabled} onChange={(e) => setProfile({ reminderEnabled: e.target.checked })} /> Ilova ichidagi eslatma (bildirishnoma emas)</label>
          <p className="text-xs text-mute">FitAI qadam, uyqu yoki yurak urishini o‘lchamaydi, chunki qurilma integratsiyasi yo‘q.</p>
        </section>
        <section className="card grid content-start gap-3 p-4 md:col-span-2"><h2 className="flex items-center gap-2 font-bold">Prototip: rol tanlash <DemoBadge /></h2>
          <p className="text-sm text-mute">Rolni bu yerda o‘zingiz tanlaysiz, shuning uchun bu haqiqiy ruxsat nazorati emas. Haqiqiy tizimda rolni faqat server belgilaydi.</p>
          <div className="flex gap-2"><button className={p.role === "student" ? "btn-primary" : "btn-ghost"} onClick={() => setProfile({ role: "student" })}>O‘quvchi</button><button className={p.role === "teacher" ? "btn-primary" : "btn-ghost"} onClick={() => setProfile({ role: "teacher" })}>O‘qituvchi / tashkilotchi</button></div>
        </section>
        <section className="card flex flex-wrap items-center justify-between gap-3 p-4 md:col-span-2"><div><h2 className="font-bold">Demo ma’lumotlarni tiklash</h2><p className="text-sm text-mute">Barcha mashqlar, ballar va sozlamalar boshlang‘ich holatga qaytadi.</p></div>
          <button className="btn-danger" onClick={() => { if (confirm("Barcha demo ma’lumotlar o‘chiriladi. Davom etasizmi?")) resetDemo(); else toast("Bekor qilindi."); }}><RotateCcw size={16} aria-hidden /> Tiklash</button></section>
      </div>
    </>
  );
}
