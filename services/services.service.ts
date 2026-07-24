import { createClient } from "@/lib/supabase/client";
import type { Service } from "@/types/database.types";

const supabase = createClient();

export type ServiceWithDepartment = Service & { department: { name: string } };

export async function getServices(): Promise<ServiceWithDepartment[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*, department:departments(name)")
    .order("name");
  if (error) throw error;
  return data as unknown as ServiceWithDepartment[];
}

export interface ServiceInput {
  name: string;
  department_id: string;
  selling_price: number;
  doctor_base_price: number;
}

export async function createService(values: ServiceInput): Promise<Service> {
  const { data, error } = await supabase.from("services").insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateService(id: string, values: ServiceInput): Promise<Service> {
  const { data, error } = await supabase
    .from("services")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}
