import Link from "next/link";
import { Activity, BarChart3, Camera, Dumbbell, ShieldCheck, Trophy, Users } from "lucide-react";
import { DEMO_PEERS, TEAMS } from "@/lib/storage/state";
import { DemoBadge } from "@/components/ui/primitives";

const FEATURES = [
  { icon: Camera, title: "AI murabbiy", text: "Brauzerdagi kamera tana nuqtalarini aniqlaydi, takrorlarni sanaydi va holat bo‘yicha qisqa maslahat beradi." },
  { icon: Users, title: "Maktab ligasi", text: "10-A, 10-B, 10-C, 10-D jamoalari ball yig‘adi va reytingda bellashadi." },
  { icon: Trophy, title: "Challenge’lar", text: "Kunlik, haftalik va jamoaviy topshiriqlar. Mukofot faqat shart bajarilganda beriladi." },
  { icon: BarChart3, title: "Shaxsiy panel", text: "Mashqlar tarixi, kunlik maqsad, suv va faol kunlar seriyasi." },
  { icon: ShieldCheck, title: "Maxfiylik", text: "Kamera tasviri qurilmangizdan chiqmaydi va saqlanmaydi." },
  { icon: Dumbbell, title: "Mashqlar kutubxonasi", text: "Qo‘llanma, xavfsizlik maslahatlari va shaxsiy kunlik reja." },
];
const STEPS = [
  { t: "Mashqni tanlang", d: "Squat, push-up yoki plank." },
  { t: "Kamerani yoqing", d: "Faqat siz boshlaganingizda ishlaydi." },
  { t: "Mashq qiling", d: "Takrorlar va holat real vaqtda ko‘rinadi." },
  { t: "Ball oling", d: "Jamoangiz reytingi yangilanadi." },
];

export default function Landing() {
  const top = [...DEMO_PEERS].sort((a, b) => b.weekPoints - a.weekPoints).slice(0, 4);
  const teams = TEAMS.map((t) => ({ ...t, points: DEMO_PEERS.filter((p) => p.teamId === t.id).reduce((s, p) => s + p.weekPoints, 0) })).sort((a, b) => b.points - a.points);
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-lime text-ink"><Activity size={18} aria-hidden /></span> FitAI</Link>
        <nav aria-label="Sayt menyusi" className="flex items-center gap-4 text-sm font-semibold text-mute"><Link href="/exercises" className="hover:text-white">Mashqlar</Link><Link href="/leaderboard" className="hover:text-white">Reyting</Link><Link href="/dashboard" className="btn-ghost !py-1.5">Kirish</Link></nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-8 md:grid-cols-[1.1fr_0.9fr] md:items-center md:pt-14">
          <div>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">Mashq qil. Rivojlan. Jamoangni g‘alabaga olib chiq.</h1>
            <p className="mt-5 max-w-xl text-lg text-mute">Sun’iy intellekt yordamida mashqlarni to‘g‘ri bajar, natijalaringni kuzat va maktabing bilan sog‘lom raqobatda qatnash.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/workout" className="btn-primary !px-6 !py-3">Mashqni boshlash</Link><Link href="/challenges" className="btn-ghost !px-6 !py-3">Challenge’larni ko‘rish</Link></div>
          </div>
          <div className="card relative aspect-[4/3] overflow-hidden">
            <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" role="img" aria-label="Tana nuqtalari chizmasi, namuna">
              <rect width="400" height="300" fill="#10120F" />
              <g stroke="#C6FF4D" strokeWidth="3" strokeLinecap="round" fill="none"><path d="M200 70 L200 150 M200 90 L165 125 L150 165 M200 90 L235 125 L250 165 M200 150 L175 205 L170 255 M200 150 L225 205 L230 255" /></g>
              <g fill="#C6FF4D"><circle cx="200" cy="55" r="14" /><circle cx="200" cy="90" r="5" /><circle cx="165" cy="125" r="5" /><circle cx="235" cy="125" r="5" /><circle cx="200" cy="150" r="5" /><circle cx="175" cy="205" r="5" /><circle cx="225" cy="205" r="5" /></g>
            </svg>
            <div className="absolute left-3 top-3"><DemoBadge>Namuna rasm, kamera emas</DemoBadge></div>
            <div className="absolute inset-x-3 bottom-3 rounded-xl bg-ink/85 px-4 py-2.5 text-center font-bold">Ajoyib! Davom eting.</div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:grid-cols-2" aria-label="Reyting va statistika namunasi">
          <div className="card p-5"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Maktab reytingi</h2><DemoBadge>Demo ma’lumot</DemoBadge></div>
            <ol className="grid gap-2 text-sm">{teams.map((t, i) => <li key={t.id} className="flex items-center justify-between rounded-xl bg-ink px-3 py-2.5"><span className="font-semibold"><span className="mr-3 text-lime">{i + 1}</span>Jamoa {t.name}</span><span className="text-mute">{t.points} ball</span></li>)}</ol>
            <p className="mt-3 text-xs text-mute">Yetakchilar: {top.map((p) => p.name).join(", ")}.</p></div>
          <div className="card p-5"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Shaxsiy statistika</h2><DemoBadge>Namuna</DemoBadge></div>
            <div className="grid grid-cols-3 gap-3 text-center"><div className="rounded-xl bg-ink p-3"><div className="text-3xl font-extrabold text-lime">12</div><div className="text-xs text-mute">mashq</div></div><div className="rounded-xl bg-ink p-3"><div className="text-3xl font-extrabold text-lime">240</div><div className="text-xs text-mute">daqiqa</div></div><div className="rounded-xl bg-ink p-3"><div className="text-3xl font-extrabold text-lime">5</div><div className="text-xs text-mute">kun ketma-ket</div></div></div>
            <p className="mt-3 text-xs text-mute">Ilovadagi raqamlar sizning saqlangan mashqlaringizdan hisoblanadi.</p></div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16"><h2 className="text-2xl font-extrabold">Qanday ishlaydi</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-4">{STEPS.map((s, i) => <li key={s.t} className="card p-4"><div className="mb-2 grid h-7 w-7 place-items-center rounded-full bg-lime text-sm font-extrabold text-ink">{i + 1}</div><div className="font-bold">{s.t}</div><p className="mt-1 text-sm text-mute">{s.d}</p></li>)}</ol></section>

        <section className="mx-auto max-w-6xl px-5 pb-16"><h2 className="text-2xl font-extrabold">Imkoniyatlar</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">{FEATURES.map(({ icon: Icon, title, text }) => <article key={title} className="card p-5"><Icon className="text-lime" size={22} aria-hidden /><h3 className="mt-3 font-bold">{title}</h3><p className="mt-1 text-sm text-mute">{text}</p></article>)}</div></section>

        <section className="mx-auto max-w-6xl px-5 pb-20"><div className="card flex flex-wrap items-center justify-between gap-4 border-lime/40 p-8"><div><h2 className="text-2xl font-extrabold">Birinchi mashqingizni bugun boshlang</h2><p className="mt-1 text-mute">Kamera kerak, ro‘yxatdan o‘tish shart emas (demo rejim).</p></div><Link href="/workout" className="btn-primary !px-6 !py-3">Mashqni boshlash</Link></div></section>
      </main>

      <footer className="border-t border-line px-5 py-8 text-sm text-mute"><div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3"><span>© FitAI — maktab sport musobaqalari uchun prototip.</span><span>Natijalar tibbiy o‘lchov emas. Mashq paytida o‘z holatingizni kuzating.</span></div></footer>
    </div>
  );
}
