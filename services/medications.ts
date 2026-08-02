import { createClient } from "@/lib/supabase/client";
import type {
  MedicationFormValues,
  MedicationSaleFormValues,
  MedicationCommissionRecipientFormValues,
} from "@/lib/validations/medications";

export type Medication = {
  id: string;
  name: string;
  selling_price: number;
  created_at: string;
};

export type MedicationSale = {
  id: string;
  medication_id: string;
  patient_id: string | null;
  quantity: number;
  sale_date: string;
  created_at: string;
  medication?: { id: string; name: string; selling_price: number } | null;
  patient?: { id: string; name: string } | null;
};

export type MedicationCommissionRecipient = {
  id: string;
  staff_id: string;
  amount_per_unit: number;
  staff?: { id: string; name: string } | null;
};

export async function fetchMedications(): Promise<Medication[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("medications").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createMedication(values: MedicationFormValues): Promise<Medication> {
  const supabase = createClient();
  const { data, error } = await supabase.from("medications").insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateMedication(
  id: string,
  values: MedicationFormValues
): Promise<Medication> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medications")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMedication(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("medications").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchMedicationSales(
  from: string,
  to: string
): Promise<MedicationSale[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medication_sales")
    .select("*, medication:medications(id, name, selling_price), patient:patients(id, name)")
    .gte("sale_date", from)
    .lte("sale_date", to)
    .order("sale_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createMedicationSale(
  values: MedicationSaleFormValues
): Promise<MedicationSale> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medication_sales")
    .insert(values)
    .select("*, medication:medications(id, name, selling_price), patient:patients(id, name)")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMedicationSale(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("medication_sales").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchMedicationCommissionRecipients(): Promise<
  MedicationCommissionRecipient[]
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medication_commission_recipients")
    .select("*, staff:staff(id, name)");
  if (error) throw error;
  return data ?? [];
}

export async function createMedicationCommissionRecipient(
  values: MedicationCommissionRecipientFormValues
): Promise<MedicationCommissionRecipient> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medication_commission_recipients")
    .insert(values)
    .select("*, staff:staff(id, name)")
    .single();
  if (error) throw error;
  return data;
}

export async function updateMedicationCommissionRecipient(
  id: string,
  amount_per_unit: number
): Promise<MedicationCommissionRecipient> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medication_commission_recipients")
    .update({ amount_per_unit })
    .eq("id", id)
    .select("*, staff:staff(id, name)")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMedicationCommissionRecipient(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("medication_commission_recipients")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
