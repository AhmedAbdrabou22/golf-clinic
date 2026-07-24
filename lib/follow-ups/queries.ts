import { createClient } from "@/lib/supabase/server";
import { toDateKey } from "./date-utils";

export type FollowUpSession = {
  id: string;
  session_date: string;
  status: "scheduled" | "completed" | "cancelled";
  notes: string | null;
  patient_forms: {
    id: string;
    form_number: string;
    patients: { name: string; phone: string | null } | null;
    doctors: { name: string } | null;
    services: { name: string } | null;
  } | null;
};

/**
 * يجيب كل الجلسات (غير الملغية) في نطاق تاريخ معين، مرتبة بالتاريخ.
 * الافتراض: بتستخدم createClient() من @/lib/supabase/server (نفس نمط middleware.ts).
 * لو الملف عندك اسمه مختلف، غيّر الاستيراد بس.
 */
export async function getSessionsInRange(
  start: Date,
  end: Date
): Promise<FollowUpSession[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
      id,
      session_date,
      status,
      notes,
      patient_forms (
        id,
        form_number,
        patients ( name, phone ),
        doctors ( name ),
        services ( name )
      )
    `
    )
    .gte("session_date", toDateKey(start))
    .lte("session_date", toDateKey(end))
    .neq("status", "cancelled")
    .order("session_date", { ascending: true });

  if (error) {
    console.error("getSessionsInRange error:", error.message);
    return [];
  }

  return (data ?? []) as unknown as FollowUpSession[];
}

/** بيجمع الجلسات في مجموعات حسب تاريخ اليوم (session_date) */
export function groupSessionsByDate(
  sessions: FollowUpSession[]
): Record<string, FollowUpSession[]> {
  return sessions.reduce<Record<string, FollowUpSession[]>>((acc, s) => {
    const key = s.session_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});
}