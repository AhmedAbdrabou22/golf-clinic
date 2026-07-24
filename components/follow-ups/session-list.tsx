import {
  FollowUpSession,
  groupSessionsByDate,
} from "@/lib/follow-ups/queries";
import { formatArabicDate, parseDateKey, todayKey } from "@/lib/follow-ups/date-utils";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "مجدولة",
  completed: "تمت",
  cancelled: "ملغية",
};

const STATUS_STYLE: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export function SessionList({ sessions }: { sessions: FollowUpSession[] }) {
  const grouped = groupSessionsByDate(sessions);
  const dateKeys = Object.keys(grouped).sort();
  const today = todayKey();

  if (dateKeys.length === 0) {
    return (
      <div className="rounded-lg border border-border p-6 text-center text-muted-foreground">
        مفيش جلسات مجدولة في الفترة دي.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dateKeys.map((key) => {
        const isToday = key === today;
        return (
          <div
            key={key}
            className={`rounded-lg border p-4 ${
              isToday ? "border-amber-400 bg-amber-50" : "border-border"
            }`}
          >
            <h3 className="font-bold mb-2 flex items-center gap-2">
              {formatArabicDate(parseDateKey(key))}
              {isToday && (
                <span className="text-xs bg-amber-400 text-white px-2 py-0.5 rounded-full">
                  النهاردة
                </span>
              )}
              <span className="text-sm text-muted-foreground font-normal">
                ({grouped[key].length} جلسة)
              </span>
            </h3>
            <ul className="divide-y divide-border">
              {grouped[key].map((s) => (
                <li key={s.id} className="py-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {s.patient_forms?.patients?.name ?? "مريض غير معروف"}
                      <span className="text-muted-foreground text-sm">
                        {" "}
                        — استمارة {s.patient_forms?.form_number}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      د. {s.patient_forms?.doctors?.name} —{" "}
                      {s.patient_forms?.services?.name}
                      {s.patient_forms?.patients?.phone
                        ? ` — ${s.patient_forms.patients.phone}`
                        : ""}
                    </p>
                    {s.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        ملحوظة: {s.notes}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${STATUS_STYLE[s.status]}`}
                  >
                    {STATUS_LABEL[s.status]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}