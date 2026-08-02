import { createClient } from "@/lib/supabase/client";
import type { MesoProductFormValues } from "@/lib/validations/meso";

export type MesoProduct = {
  id: string;
  name: string;
  company: string | null;
  price_half_ml: number | null;
  price_1ml: number | null;
  created_at: string;
};

export async function fetchMesoProducts(): Promise<MesoProduct[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("meso_products")
    .select("*")
    .order("company")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createMesoProduct(values: MesoProductFormValues): Promise<MesoProduct> {
  const supabase = createClient();
  const { data, error } = await supabase.from("meso_products").insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateMesoProduct(
  id: string,
  values: MesoProductFormValues
): Promise<MesoProduct> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("meso_products")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMesoProduct(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("meso_products").delete().eq("id", id);
  if (error) throw error;
}
