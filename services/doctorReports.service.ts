import { createClient } from "@/lib/supabase/client";

export interface DoctorBasicInfo {
  id: string;
  name: string;
  employment_type: "fixed_salary" | "hourly";
  commission_percentage: number;
  department_name: string | null;
}

export interface CompletedSessionRow {
  session_id: string;
  session_date: string;
  amount_paid: number;
  is_last_session: boolean;
  form_number: string;
  patient_name: string;
  service_name: string;
}

export interface CommissionRow {
  id: string;
  created_at: string;
  commission_amount: number;
  form_number: string;
  patient_name: string;
  customer_price: number;
  doctor_base_price: number;
}

export interface AttendanceRow {
  id: string;
  work_date: string;
  hours_worked: number;
  hourly_rate_snapshot: number;
  amount: number;
}

export interface DoctorReportDetail {
  doctor: DoctorBasicInfo;
  sessions: CompletedSessionRow[];
  commissions: CommissionRow[];
  attendance: AttendanceRow[]; // فاضية لو الدكتور راتب ثابت
  currentMonthlySalary: number | null; // فقط لو الدكتور راتب ثابت
  totals: {
    sessionsCount: number;
    commissionTotal: number;
    attendanceHoursTotal: number;
    attendanceAmountTotal: number;
  };
}

export interface DoctorReportSummaryRow {
  doctorId: string;
  doctorName: string;
  departmentName: string | null;
  employmentType: "fixed_salary" | "hourly";
  completedSessionsCount: number;
  commissionTotal: number;
  attendanceAmountTotal: number; // 0 لو راتب ثابت
}

function toExclusiveISODate(dateStr: string) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return `${d.toISOString().slice(0, 10)}T00:00:00`;
}

async function getDoctorBasicInfo(doctorId: string): Promise<DoctorBasicInfo> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("doctors")
    .select("id, name, employment_type, commission_percentage, departments(name)")
    .eq("id", doctorId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    employment_type: data.employment_type,
    commission_percentage: data.commission_percentage,
    department_name: (data as any).departments?.name ?? null,
  };
}

async function getCompletedSessions(
  doctorId: string,
  from: string,
  to: string
): Promise<CompletedSessionRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      `id, session_date, amount_paid, is_last_session,
       patient_forms!inner(form_number, doctor_id, patients(name), services(name))`
    )
    .eq("patient_forms.doctor_id", doctorId)
    .eq("status", "completed")
    .gte("session_date", from)
    .lte("session_date", to)
    .order("session_date", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    session_id: row.id,
    session_date: row.session_date,
    amount_paid: row.amount_paid,
    is_last_session: row.is_last_session,
    form_number: row.patient_forms.form_number,
    patient_name: row.patient_forms.patients?.name ?? "—",
    service_name: row.patient_forms.services?.name ?? "—",
  }));
}

async function getCommissions(
  doctorId: string,
  from: string,
  to: string
): Promise<CommissionRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("doctor_commissions")
    .select(
      `id, created_at, commission_amount,
       patient_forms(form_number, customer_price, doctor_base_price, patients(name))`
    )
    .eq("doctor_id", doctorId)
    .gte("created_at", `${from}T00:00:00`)
    .lt("created_at", toExclusiveISODate(to))
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    created_at: row.created_at,
    commission_amount: row.commission_amount,
    form_number: row.patient_forms?.form_number ?? "—",
    patient_name: row.patient_forms?.patients?.name ?? "—",
    customer_price: row.patient_forms?.customer_price ?? 0,
    doctor_base_price: row.patient_forms?.doctor_base_price ?? 0,
  }));
}

async function getAttendance(
  doctorId: string,
  from: string,
  to: string
): Promise<AttendanceRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("doctor_daily_logs")
    .select("id, work_date, hours_worked, hourly_rate_snapshot, amount")
    .eq("doctor_id", doctorId)
    .gte("work_date", from)
    .lte("work_date", to)
    .order("work_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function getCurrentMonthlySalary(doctorId: string): Promise<number | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("doctor_salary")
    .select("monthly_salary")
    .eq("doctor_id", doctorId)
    .order("effective_from", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.monthly_salary ?? null;
}

export async function getDoctorReportDetail(
  doctorId: string,
  from: string,
  to: string
): Promise<DoctorReportDetail> {
  const doctor = await getDoctorBasicInfo(doctorId);

  const [sessions, commissions, attendance, currentMonthlySalary] = await Promise.all([
    getCompletedSessions(doctorId, from, to),
    getCommissions(doctorId, from, to),
    doctor.employment_type === "hourly"
      ? getAttendance(doctorId, from, to)
      : Promise.resolve([] as AttendanceRow[]),
    doctor.employment_type === "fixed_salary"
      ? getCurrentMonthlySalary(doctorId)
      : Promise.resolve(null),
  ]);

  const commissionTotal = commissions.reduce((sum, c) => sum + c.commission_amount, 0);
  const attendanceHoursTotal = attendance.reduce((sum, a) => sum + a.hours_worked, 0);
  const attendanceAmountTotal = attendance.reduce((sum, a) => sum + a.amount, 0);

  return {
    doctor,
    sessions,
    commissions,
    attendance,
    currentMonthlySalary,
    totals: {
      sessionsCount: sessions.length,
      commissionTotal,
      attendanceHoursTotal,
      attendanceAmountTotal,
    },
  };
}

/**
 * ملخص كل الأطباء في فترة معينة - نفس أسلوب dashboard.service.ts
 * (تجميع Client-side لأن Supabase JS مش بيعمل SUM سيرفر-سايد بسهولة من غير RPC)
 */
export async function getDoctorsReportSummary(
  from: string,
  to: string
): Promise<DoctorReportSummaryRow[]> {
  const supabase = createClient();

  const { data: doctors, error: doctorsError } = await supabase
    .from("doctors")
    .select("id, name, employment_type, departments(name)")
    .order("name", { ascending: true });

  if (doctorsError) throw doctorsError;
  if (!doctors || doctors.length === 0) return [];

  const toExclusiveStr = toExclusiveISODate(to);

  const [
    { data: commissionRows, error: commError },
    { data: sessionRows, error: sessError },
    { data: attendanceRows, error: attError },
  ] = await Promise.all([
    supabase
      .from("doctor_commissions")
      .select("doctor_id, commission_amount, created_at")
      .gte("created_at", `${from}T00:00:00`)
      .lt("created_at", toExclusiveStr),
    supabase
      .from("sessions")
      .select("patient_forms!inner(doctor_id)")
      .eq("status", "completed")
      .gte("session_date", from)
      .lte("session_date", to),
    supabase
      .from("doctor_daily_logs")
      .select("doctor_id, amount")
      .gte("work_date", from)
      .lte("work_date", to),
  ]);

  if (commError) throw commError;
  if (sessError) throw sessError;
  if (attError) throw attError;

  const commissionByDoctor = new Map<string, number>();
  (commissionRows ?? []).forEach((r: any) => {
    commissionByDoctor.set(
      r.doctor_id,
      (commissionByDoctor.get(r.doctor_id) ?? 0) + r.commission_amount
    );
  });

  const sessionsCountByDoctor = new Map<string, number>();
  (sessionRows ?? []).forEach((r: any) => {
    const doctorId = r.patient_forms?.doctor_id;
    if (!doctorId) return;
    sessionsCountByDoctor.set(doctorId, (sessionsCountByDoctor.get(doctorId) ?? 0) + 1);
  });

  const attendanceByDoctor = new Map<string, number>();
  (attendanceRows ?? []).forEach((r: any) => {
    attendanceByDoctor.set(
      r.doctor_id,
      (attendanceByDoctor.get(r.doctor_id) ?? 0) + r.amount
    );
  });

  return doctors.map((d: any) => ({
    doctorId: d.id,
    doctorName: d.name,
    departmentName: d.departments?.name ?? null,
    employmentType: d.employment_type,
    completedSessionsCount: sessionsCountByDoctor.get(d.id) ?? 0,
    commissionTotal: commissionByDoctor.get(d.id) ?? 0,
    attendanceAmountTotal: attendanceByDoctor.get(d.id) ?? 0,
  }));
}
