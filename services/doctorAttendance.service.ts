import { createClient } from "@/lib/supabase/client";
import type { DoctorDailyLog } from "@/types/database.types";

const supabase = createClient();

export async function getDoctorAttendance(doctorId: string): Promise<DoctorDailyLog[]> {
  const { data, error } = await supabase
    .from("doctor_daily_logs")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("work_date", { ascending: false });
  if (error) throw error;
  return data;
}

export interface AttendanceInput {
  work_date: string;
  hours_worked: number;
}

// hourly_rate_snapshot + amount are computed server-side (trg_calc_daily_log)
// from the doctor's current hourly_rate — never sent from the client.
export async function logAttendance(
  doctorId: string,
  values: AttendanceInput
): Promise<DoctorDailyLog> {
  const { data, error } = await supabase
    .from("doctor_daily_logs")
    .insert({ doctor_id: doctorId, ...values })
    .select()
    .single();
  if (error) throw error;
  return data;
}