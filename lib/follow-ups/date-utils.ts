export type FollowUpView = "day" | "week" | "month";

export const ARABIC_DAY_NAMES = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

export const ARABIC_MONTH_NAMES = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

/** يحول تاريخ لصيغة YYYY-MM-DD المطلوبة لعمود date في بوستجرس */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

/** بداية أسبوع (الأحد) ونهايته (السبت) لتاريخ معين */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay()); // رجوع لآخر أحد
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // السبت
  return { start, end };
}

/** بداية الشهر ونهايته لتاريخ معين */
export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
}

/** يرجع نطاق البداية/النهاية حسب نوع الفيو */
export function getRangeForView(
  view: FollowUpView,
  anchor: Date
): { start: Date; end: Date } {
  if (view === "day") {
    const start = new Date(anchor);
    start.setHours(0, 0, 0, 0);
    return { start, end: start };
  }
  if (view === "week") return getWeekRange(anchor);
  return getMonthRange(anchor);
}

export function addDays(d: Date, days: number): Date {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + days);
  return nd;
}

export function addMonths(d: Date, months: number): Date {
  const nd = new Date(d);
  nd.setMonth(nd.getMonth() + months);
  return nd;
}

export function formatArabicDate(d: Date): string {
  return `${ARABIC_DAY_NAMES[d.getDay()]} ${d.getDate()} ${
    ARABIC_MONTH_NAMES[d.getMonth()]
  } ${d.getFullYear()}`;
}