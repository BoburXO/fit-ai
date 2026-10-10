import type { LucideIcon } from "lucide-react";
import { AlertTriangle, FlaskConical } from "lucide-react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-mute">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function DemoBadge({ children = "Demo" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/30 bg-amber-300/10 px-1.5 py-0.5 text-xs font-semibold text-amber-200">
      <FlaskConical size={12} aria-hidden /> {children}
    </span>
  );
}

export function MetricCard({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm text-mute"><Icon size={16} className="text-lime" aria-hidden /> {label}</div>
      <div className="mt-2 text-3xl font-extrabold">{value}</div>
      {hint && <div className="mt-1 text-xs text-mute">{hint}</div>}
    </div>
  );
}

export function ProgressRing({ percent, size = 96, label }: { percent: number; size?: number; label?: string }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, percent));
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`${label ?? "Bajarilish"}: ${p}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2E332C" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#C6FF4D" strokeWidth={8} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} style={{ transition: "stroke-dashoffset .6s" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-lg font-extrabold">{p}%</div>
    </div>
  );
}

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="card grid place-items-center gap-2 px-6 py-12 text-center">
      <Icon size={28} className="text-lime" aria-hidden />
      <div className="font-bold">{title}</div>
      <p className="max-w-sm text-sm text-mute">{text}</p>
      {action}
    </div>
  );
}

export function ErrorState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-400/40 bg-[#2a1717] p-4 text-red-100">
      <div className="flex items-center gap-2 font-bold"><AlertTriangle size={18} aria-hidden /> {title}</div>
      <p className="mt-1 text-sm text-red-200/90">{text}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "h-24" }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} aria-hidden />;
}

export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Yuklanmoqda" className="grid gap-4">
      <Skeleton className="h-10 w-1/2" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div>
      <Skeleton className="h-64" />
    </div>
  );
}
