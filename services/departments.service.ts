import { createClient } from "@/lib/supabase/client";
import type { Department } from "@/types/database.types";

const supabase = createClient();

export async function getDepartments(): Promise<Department[]> {
  const { data, error } = await supabase.from("departments").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function createDepartment(name: string): Promise<Department> {
  const { data, error } = await supabase.from("departments").insert({ name }).select().single();
  if (error) throw error;
  return data;
}

export async function updateDepartment(id: string, name: string): Promise<Department> {
  const { data, error } = await supabase
    .from("departments")
    .update({ name })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDepartment(id: string): Promise<void> {
  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) throw error;
}
