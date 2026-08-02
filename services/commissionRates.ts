import { createClient } from "@/lib/supabase/client";
import type {
  DoctorCommissionRateFormValues,
  DoctorTargetBonusFormValues,
} from "@/lib/validations/commission";

export type CommissionCategory = { id: string; name: string };

export type DoctorCommissionRate = {
  id: string;
  doctor_id: string;
  commission_category_id: string;
  percentage: number;
  effective_from: string;
  commission_category?: CommissionCategory | null;
};

export type DoctorTargetBonusRule = {
  id: string;
  doctor_id: string;
  monthly_target_sessions: number;
  bonus_hourly_rate: number | null;
  bonus_commission_percentage: number;
  is_active: boolean;
};

export async function fetchCommissionCategories(): Promise<CommissionCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("commission_categories")
    .select("id, name")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createCommissionCategory(name: string): Promise<CommissionCategory> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("commission_categories")
    .insert({ name })
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
}

export async function fetchDoctorCommissionRates(
  doctorId: string
): Promise<DoctorCommissionRate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("doctor_commission_rates")
    .select("*, commission_category:commission_categories(id, name)")
    .eq("doctor_id", doctorId)
    .order("effective_from", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createDoctorCommissionRate(
  values: DoctorCommissionRateFormValues
): Promise<DoctorCommissionRate> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("doctor_commission_rates")
    .insert(values)
    .select("*, commission_category:commission_categories(id, name)")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDoctorCommissionRate(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("doctor_commission_rates").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchDoctorTargetBonusRule(
  doctorId: string
): Promise<DoctorTargetBonusRule | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("doctor_target_bonus_rules")
    .select("*")
    .eq("doctor_id", doctorId)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertDoctorTargetBonusRule(
  values: DoctorTargetBonusFormValues,
  existingId?: string
): Promise<DoctorTargetBonusRule> {
  const supabase = createClient();
  if (existingId) {
    const { data, error } = await supabase
      .from("doctor_target_bonus_rules")
      .update(values)
      .eq("id", existingId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("doctor_target_bonus_rules")
    .insert(values)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deactivateDoctorTargetBonusRule(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("doctor_target_bonus_rules")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw error;
}

/** عدد الجلسات المكتملة للدكتور في الشهر الحالي (بيستخدم دالة قاعدة البيانات مباشرة) */
export async function fetchDoctorCompletedSessionsThisMonth(doctorId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_doctor_completed_sessions_this_month", {
    p_doctor_id: doctorId,
  });
  if (error) throw error;
  return (data as number) ?? 0;
}

/** النسبة الفعلية المستحقة للدكتور على خدمة معينة الآن (تراعي بونص التارجت) */
export async function fetchDoctorEffectiveCommissionPercentage(
  doctorId: string,
  serviceId: string
): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_doctor_commission_percentage", {
    p_doctor_id: doctorId,
    p_service_id: serviceId,
  });
  if (error) throw error;
  return (data as number) ?? 0;
}

// ---------------- ربط الخدمة بتصنيف العمولة ----------------

export async function updateServiceCommissionCategory(
  serviceId: string,
  commissionCategoryId: string | null
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("services")
    .update({ commission_category_id: commissionCategoryId })
    .eq("id", serviceId);
  if (error) throw error;
}
