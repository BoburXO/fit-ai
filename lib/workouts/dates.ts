/** School day boundaries use Asia/Tashkent (UTC+5) by default. */
export const DEFAULT_TZ_OFFSET_MIN = 300;

export function dayKey(iso: string | number | Date, tzOffsetMin = DEFAULT_TZ_OFFSET_MIN): string {
  const t = new Date(iso).getTime() + tzOffsetMin * 60_000;
  return new Date(t).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * 86_400_000).toISOString();
}

export function daysBetweenKeys(a: string, b: string): number {
  return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86_400_000);
}
