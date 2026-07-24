import { getSessionsInRange } from "@/lib/follow-ups/queries";
import {
  FollowUpView,
  addDays,
  addMonths,
  getRangeForView,
  toDateKey,
  todayKey,
} from "@/lib/follow-ups/date-utils";
import { ViewSwitcher, DateNav } from "@/components/follow-ups/view-switcher";
import { SessionList } from "@/components/follow-ups/session-list";
import { TodayAlert } from "@/components/follow-ups/today-alert";

export const dynamic = "force-dynamic"; // البيانات لازم تكون لحظية (جلسات النهاردة بتتغير)

function getPrevNextKeys(view: FollowUpView, anchor: Date) {
  if (view === "day") {
    return { prevKey: toDateKey(addDays(anchor, -1)), nextKey: toDateKey(addDays(anchor, 1)) };
  }
  if (view === "week") {
    return { prevKey: toDateKey(addDays(anchor, -7)), nextKey: toDateKey(addDays(anchor, 7)) };
  }
  return { prevKey: toDateKey(addMonths(anchor, -1)), nextKey: toDateKey(addMonths(anchor, 1)) };
}

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: { view?: string; date?: string };
}) {
  const view: FollowUpView =
    searchParams.view === "week" || searchParams.view === "month"
      ? searchParams.view
      : "day";

  const anchor = searchParams.date
    ? new Date(searchParams.date + "T00:00:00")
    : new Date();

  const { start, end } = getRangeForView(view, anchor);
  const sessions = await getSessionsInRange(start, end);

  // جلسات النهاردة بتتجاب لوحدها عشان تظهر في شريط التنبيه دايمًا، مهما كان الفيو المختار
  const today = new Date();
  const todaySessions = await getSessionsInRange(today, today);

  const { prevKey, nextKey } = getPrevNextKeys(view, anchor);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">متابعة الجلسات</h1>
        <ViewSwitcher currentView={view} dateKey={toDateKey(anchor)} />
      </div>

      <TodayAlert sessions={todaySessions} />

      <DateNav view={view} prevKey={prevKey} nextKey={nextKey} todayKey={todayKey()} />

      <SessionList sessions={sessions} />
    </div>
  );
}