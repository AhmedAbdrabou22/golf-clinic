import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface DoctorCommissionInput {
  doctor_id: string;
  service_category_id: string;
  commission_percentage: number;
  target_amount?: number | null;
  target_commission_percentage?: number | null;
}

export async function getDoctorCommissions(doctorId: string) {
  const { data, error } = await supabase
    .from("doctor_commissions")
    .select(
      `
      *,
      service_category:service_categories(
        id,
        name
      )
    `
    )
    .eq("doctor_id", doctorId)
    .order("created_at");

  if (error) throw error;

  return data;
}

export async function createDoctorCommission(
  values: DoctorCommissionInput
) {
  const { data, error } = await supabase
    .from("doctor_commissions")
    .insert(values)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateDoctorCommission(
  id: string,
  values: Partial<DoctorCommissionInput>
) {
  const { data, error } = await supabase
    .from("doctor_commissions")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteDoctorCommission(id: string) {
  const { error } = await supabase
    .from("doctor_commissions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function resolveDoctorCommission(
  doctorId: string,
  serviceCategoryId: string,
  monthlyRevenue: number
) {
  const { data, error } = await supabase
    .from("doctor_commissions")
    .select("*")
    .eq("doctor_id", doctorId)
    .eq("service_category_id", serviceCategoryId)
    .single();

  if (error) throw error;

  if (
    data.target_amount &&
    monthlyRevenue >= data.target_amount &&
    data.target_commission_percentage !== null
  ) {
    return data.target_commission_percentage;
  }

  return data.commission_percentage;
}