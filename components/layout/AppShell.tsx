"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, CalendarCheck, ClipboardList, Dumbbell, History, LayoutDashboard, ShieldCheck, Trophy, UserRound } from "lucide-react";
import { useApp } from "./AppProvider";
import { can } from "@/lib/auth/permissions";
import { DemoBadge, PageSkeleton } from "@/components/ui/primitives";

const NAV = [
  { href: "/dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
  { href: "/workout", label: "AI mashq", icon: Activity, primary: true },
  { href: "/exercises", label: "Mashqlar", icon: BookOpen },
  { href: "/plan", label: "Reja", icon: CalendarCheck },
  { href: "/challenges", label: "Challenge", icon: Dumbbell },
  { href: "/leaderboard", label: "Reyting", icon: Trophy },
  { href: "/history", label: "Tarix", icon: History },
  { href: "/profile", label: "Profil", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { state, ready } = useApp();
  const items = can(state.profile.role, "admin:view") ? [...NAV, { href: "/admin", label: "Tashkilotchi", icon: ShieldCheck }] : NAV;
  const mobile = items.filter((i) => ["/dashboard", "/workout", "/challenges", "/leaderboard", "/profile"].includes(i.href));
  const active = (h: string) => path === h || path.startsWith(h + "/");

  return (
    <div className="min-h-screen md:grid md:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-panel p-4 md:flex">
        <Link href="/" className="mb-6 flex items-center gap-2 px-2 text-xl font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-lime text-ink"><Activity size={18} aria-hidden /></span> FitAI
        </Link>
        <nav aria-label="Asosiy menyu" className="grid gap-1">
          {items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${active(href) ? "bg-lime text-ink" : "text-mute hover:bg-raised hover:text-white"}`}>
              <Icon size={18} aria-hidden /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-line p-3 text-xs text-mute">
          <DemoBadge>Demo rejim</DemoBadge>
          <p className="mt-2">Ma’lumotlar faqat shu brauzerda saqlanadi.</p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-line px-4 py-3 md:px-8">
          <div className="text-sm text-mute">{ready ? <>Salom, <span className="font-semibold text-white">{state.profile.name}</span></> : "\u00A0"}</div>
          <div className="flex items-center gap-2 text-xs">
            {state.profile.teamId && <span className="rounded-md border border-line px-2 py-1 font-semibold">Jamoa {state.profile.teamId}</span>}
            <DemoBadge>Prototip</DemoBadge>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-8 md:pb-10">{ready ? children : <PageSkeleton />}</main>
      </div>

      <nav aria-label="Mobil menyu" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-panel/95 backdrop-blur md:hidden">
        {mobile.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${active(href) ? "text-lime" : "text-mute"}`}>
            <Icon size={20} aria-hidden /> {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
