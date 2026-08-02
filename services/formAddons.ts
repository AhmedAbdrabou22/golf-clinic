import { createClient } from "@/lib/supabase/client";
import type { MesoLineFormValues } from "@/lib/validations/meso";

export type MesoLine = {
  id: string;
  form_id: string;
  meso_product_id: string;
  quantity_ml: number;
  price: number;
  created_at: string;
  meso_product?: { id: string; name: string; company: string | null } | null;
};

export type SkinGrowth = {
  form_id: string;
  count: number;
  total_price: number;
  updated_at: string;
};

// ---------------- ميزو ----------------

export async function fetchMesoLines(formId: string): Promise<MesoLine[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("form_meso_lines")
    .select("*, meso_product:meso_products(id, name, company)")
    .eq("form_id", formId)
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function addMesoLine(values: MesoLineFormValues): Promise<MesoLine> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("form_meso_lines")
    .insert(values)
    .select("*, meso_product:meso_products(id, name, company)")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMesoLine(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("form_meso_lines").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchMesoTotal(formId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("form_meso_totals")
    .select("meso_total")
    .eq("form_id", formId)
    .maybeSingle();
  if (error) throw error;
  return data?.meso_total ?? 0;
}

// ---------------- زوائد جلدية ----------------

export async function fetchSkinGrowth(formId: string): Promise<SkinGrowth | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("form_skin_growths")
    .select("*")
    .eq("form_id", formId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertSkinGrowthCount(
  formId: string,
  count: number
): Promise<SkinGrowth> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("form_skin_growths")
    .upsert({ form_id: formId, count }, { onConflict: "form_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
