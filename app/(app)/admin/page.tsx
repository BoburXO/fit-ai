"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Plus } from "lucide-react";
import { useApp } from "@/components/layout/AppProvider";
import { useBoard } from "@/hooks/useBoard";
import { can } from "@/lib/auth/permissions";
import { challengeStatus } from "@/lib/challenges/progress";
import { challengeFormSchema } from "@/lib/validation/schemas";
import { addDays } from "@/lib/workouts/dates";
import { DEMO_PEERS } from "@/lib/storage/state";
import { DemoBadge, ErrorState, PageHeader } from "@/components/ui/primitives";
import type { Challenge } from "@/types/domain";

const STATUS_UZ = { upcoming: "Tez orada", active: "Faol", closed: "Yopilgan" } as const;

export default function AdminPage() {
  const { state, now, upsertChallenge, toast, setProfile } = useApp();
  const { teams } = useBoard("all");
  const [form, setForm] = useState({ title: "", description: "", kind: "weekly", scope: "individual", metric: "workouts", target: 5, rewardPoints: 50, days: 7 });
  const [errors, setErrors] = useState<string | null>(null);

  if (!can(state.profile.role, "admin:view")) {
    return (<>
      <PageHeader title="Tashkilotchi paneli" />
      <ErrorState title="Ushbu amal uchun ruxsatingiz yo‘q." text="Bu sahifa faqat o‘qituvchi/tashkilotchi roli uchun. Demo rejimda rolni Profil sahifasidan almashtirish mumkin (prototip, xavfsizlik chorasi emas)." action={<button className="btn-ghost" onClick={() => setProfile({ role: "teacher" })}><Lock size={14} aria-hidden /> Demo: o‘qituvchi rolini tanlash</button>} />
    </>);
  }

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = challengeFormSchema.safeParse(form);
    if (!parsed.success) { setErrors(parsed.error.issues.map((i) => i.message).join(", ")); return; }
    setErrors(null);
    const d = parsed.data;
    const start = new Date().toISOString();
    const c: Challenge = { id: `ch-${Date.now()}`, title: d.title, description: d.description, rules: ["Faqat kamera orqali o‘lchangan, yakunlangan mashqlar hisoblanadi."], kind: d.kind, scope: d.scope, metric: d.metric, target: d.target, rewardPoints: d.rewardPoints, startsAt: start, endsAt: addDays(start, d.days), closed: false, isDemo: false };
    upsertChallenge(c);
    toast("Challenge yaratildi.");
    setForm({ ...form, title: "", description: "" });
  };

  return (
    <>
      <PageHeader title="Tashkilotchi paneli" subtitle="Musobaqalarni boshqarish va yozuvlarni tekshirish." action={<DemoBadge>Prototip roli</DemoBadge>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card overflow-x-auto p-4"><h2 className="mb-2 font-bold">Jamoalar</h2>
          <table className="w-full min-w-[360px] text-sm"><thead className="text-left text-mute"><tr><th className="py-2">Jamoa</th><th>Ball</th><th>Faol</th><th>Demo o‘quvchi</th></tr></thead>
            <tbody>{teams.map((t) => <tr key={t.teamId} className="border-t border-line"><td className="py-2 font-semibold">{t.name}</td><td>{t.points}</td><td>{t.activeMembers}</td><td>{DEMO_PEERS.filter((p) => p.teamId === t.teamId).length}</td></tr>)}</tbody></table>
          <Link href="/leaderboard" className="btn-ghost mt-3 !py-1.5">To‘liq reyting</Link></section>

        <section className="card p-4"><h2 className="mb-2 font-bold">Yangi challenge</h2>
          <form onSubmit={create} className="grid gap-3">
            <div><label className="label" htmlFor="ct">Nomi</label><input id="ct" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="label" htmlFor="cd">Tavsif</label><textarea id="cd" className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label" htmlFor="ck">Turi</label><select id="ck" className="input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}><option value="daily">Kunlik</option><option value="weekly">Haftalik</option><option value="special">Maxsus</option></select></div>
              <div><label className="label" htmlFor="cs">Qamrov</label><select id="cs" className="input" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}><option value="individual">Shaxsiy</option><option value="team">Jamoaviy</option></select></div>
              <div><label className="label" htmlFor="cm">Mezon</label><select id="cm" className="input" value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })}><option value="workouts">Mashqlar soni</option><option value="reps">Takrorlar</option><option value="active_days">Faol kunlar</option><option value="minutes">Daqiqalar</option></select></div>
              <div><label className="label" htmlFor="cg">Maqsad (son)</label><input id="cg" type="number" className="input" value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} /></div>
              <div><label className="label" htmlFor="cr">Mukofot (ball)</label><input id="cr" type="number" className="input" value={form.rewardPoints} onChange={(e) => setForm({ ...form, rewardPoints: Number(e.target.value) })} /></div>
              <div><label className="label" htmlFor="cy">Davomiyligi (kun)</label><input id="cy" type="number" className="input" value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} /></div>
            </div>
            {errors && <p role="alert" className="text-sm text-red-300">{errors}</p>}
            <button className="btn-primary" type="submit"><Plus size={16} aria-hidden /> Yaratish</button>
          </form></section>

        <section className="card overflow-x-auto p-4 lg:col-span-2"><h2 className="mb-2 font-bold">Challenge’lar</h2>
          <table className="w-full min-w-[520px] text-sm"><thead className="text-left text-mute"><tr><th className="py-2">Nomi</th><th>Holat</th><th>Qatnashuvchi</th><th></th></tr></thead>
            <tbody>{state.challenges.map((c) => { const st = challengeStatus(c, now); return (
              <tr key={c.id} className="border-t border-line"><td className="py-2 font-semibold">{c.title}</td><td>{STATUS_UZ[st]}</td><td>{state.joined[c.id] ? "1 (siz)" : "0"}</td>
                <td className="text-right"><button className="btn-ghost !py-1" onClick={() => upsertChallenge({ ...c, closed: !c.closed })}>{c.closed ? "Qayta ochish" : "Yopish"}</button></td></tr>); })}</tbody></table>
          <p className="mt-2 text-xs text-mute">Qatnashuvchilar soni faqat shu brauzerdagi yozuvlardan; ko‘p foydalanuvchili statistika uchun server (PostgreSQL) kerak.</p></section>

        <section className="card overflow-x-auto p-4 lg:col-span-2"><h2 className="mb-2 font-bold">Ball daftari (so‘nggi 20)</h2>
          {state.ledger.length === 0 ? <p className="text-sm text-mute">Hali ball yozuvlari yo‘q.</p> : (
            <table className="w-full min-w-[560px] text-sm"><thead className="text-left text-mute"><tr><th className="py-2">Sana</th><th>Sabab</th><th>Ball</th><th>Kalit (dublikatga qarshi)</th></tr></thead>
              <tbody>{state.ledger.slice(-20).reverse().map((e) => <tr key={e.id} className="border-t border-line"><td className="py-2">{new Date(e.createdAt).toLocaleString("uz-UZ")}</td><td>{e.reason}</td><td>+{e.points}</td><td className="font-mono text-xs text-mute">{e.key}</td></tr>)}</tbody></table>)}
        </section>
      </div>
    </>
  );
}
