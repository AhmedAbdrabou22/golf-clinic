import { createClient } from "@/lib/supabase/client";
import type { Patient } from "@/types/database.types";
import type { PatientFormValues } from "@/lib/validations/patient";

const supabase = createClient();

export async function getPatients(search?: string): Promise<Patient[]> {
  let query = supabase.from("patients").select("*").order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPatientById(id: string): Promise<Patient> {
  const { data, error } = await supabase.from("patients").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createPatient(values: PatientFormValues): Promise<Patient> {
  const { data, error } = await supabase.from("patients").insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updatePatient(id: string, values: PatientFormValues): Promise<Patient> {
  const { data, error } = await supabase
    .from("patients")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePatient(id: string): Promise<void> {
  const { error } = await supabase.from("patients").delete().eq("id", id);
  if (error) throw error;
}
