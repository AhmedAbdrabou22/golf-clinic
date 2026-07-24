import Link from "next/link";
import { FollowUpView } from "@/lib/follow-ups/date-utils";

const VIEWS: { value: FollowUpView; label: string }[] = [
  { value: "day", label: "يومي" },
  { value: "week", label: "أسبوعي" },
  { value: "month", label: "شهري" },
];

export function ViewSwitcher({
  currentView,
  dateKey,
}: {
  currentView: FollowUpView;
  dateKey: string;
}) {
  return (
    <div className="flex gap-2">
      {VIEWS.map((v) => (
        <Link
          key={v.value}
          href={`/follow-ups?view=${v.value}&date=${dateKey}`}
          className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
            currentView === v.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground border-border hover:bg-muted"
          }`}
        >
          {v.label}
        </Link>
      ))}
    </div>
  );
}

/** أزرار السابق / التالي / النهاردة */
export function DateNav({
  view,
  prevKey,
  nextKey,
  todayKey,
}: {
  view: FollowUpView;
  prevKey: string;
  nextKey: string;
  todayKey: string;
}) {
  return (
    <div className="flex gap-2">
      <Link
        href={`/follow-ups?view=${view}&date=${prevKey}`}
        className="px-3 py-2 rounded-md border border-border hover:bg-muted text-sm"
      >
        السابق ◀
      </Link>
      <Link
        href={`/follow-ups?view=${view}&date=${todayKey}`}
        className="px-3 py-2 rounded-md border border-border hover:bg-muted text-sm"
      >
        النهاردة
      </Link>
      <Link
        href={`/follow-ups?view=${view}&date=${nextKey}`}
        className="px-3 py-2 rounded-md border border-border hover:bg-muted text-sm"
      >
        ▶ التالي
      </Link>
    </div>
  );
}