export type ReportPeriod = "daily" | "weekly" | "monthly";

function toDateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDateISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * الأسبوع بيبدأ السبت وينتهي الجمعة (العرف المصري).
 * لو عايز تغيّرها لأي بداية تانية، غيّر قيمة diffFromSaturday بس.
 */
function getWeekStart(d: Date) {
  const date = toDateOnly(d);
  const dow = date.getDay(); // 0=الأحد ... 6=السبت
  const diffFromSaturday = (dow + 1) % 7; // السبت -> 0
  date.setDate(date.getDate() - diffFromSaturday);
  return date;
}

export function getReportRange(period: ReportPeriod, referenceDate: string) {
  const ref = toDateOnly(new Date(referenceDate));

  if (period === "daily") {
    return { from: formatDateISO(ref), to: formatDateISO(ref) };
  }

  if (period === "weekly") {
    const start = getWeekStart(ref);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { from: formatDateISO(start), to: formatDateISO(end) };
  }

  // شهري
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  return { from: formatDateISO(start), to: formatDateISO(end) };
}

const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export function formatArabicDate(isoDate: string) {
  const d = new Date(isoDate);
  return `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatRangeLabel(period: ReportPeriod, from: string, to: string) {
  if (period === "daily" || from === to) return formatArabicDate(from);
  return `من ${formatArabicDate(from)} إلى ${formatArabicDate(to)}`;
}
