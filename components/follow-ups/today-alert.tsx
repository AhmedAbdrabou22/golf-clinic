import { FollowUpSession } from "@/lib/follow-ups/queries";

export function TodayAlert({ sessions }: { sessions: FollowUpSession[] }) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
        مفيش جلسات مجدولة النهاردة.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
      <p className="font-bold text-amber-900 mb-2">
        ⚠️ خلي بالك، عندك {sessions.length} جلسة النهاردة:
      </p>
      <ul className="space-y-1">
        {sessions.map((s) => (
          <li key={s.id} className="text-amber-900">
            •{" "}
            <span className="font-semibold">
              {s.patient_forms?.patients?.name ?? "مريض غير معروف"}
            </span>{" "}
            — استمارة {s.patient_forms?.form_number} — د.{" "}
            {s.patient_forms?.doctors?.name} — {s.patient_forms?.services?.name}
          </li>
        ))}
      </ul>
    </div>
  );
}