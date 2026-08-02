import { createClient } from "@/lib/supabase/client";
import type {
  StaffFormValues,
  StaffSessionCommissionRuleFormValues,
} from "@/lib/validations/staff";

export type Staff = {
  id: string;
  name: string;
  role: "reception" | "assistant" | "sterilization" | "nursing";
  monthly_salary: number | null;
  phone: string | null;
  created_at: string;
};

export type StaffSessionCommissionRule = {
  id: string;
  staff_id: string;
  service_id: string;
  amount_per_session: number;
  service?: { id: string; name: string } | null;
};

export type StaffCommissionEarned = {
  id: string;
  staff_id: string;
  source_type: "session" | "medication";
  source_id: string;
  amount: number;
  created_at: string;
};

export async function fetchStaff(): Promise<Staff[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("staff").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createStaff(values: StaffFormValues): Promise<Staff> {
  const supabase = createClient();
  const { data, error } = await supabase.from("staff").insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateStaff(id: string, values: StaffFormValues): Promise<Staff> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("staff")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStaff(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("staff").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchStaffCommissionRules(
  staffId: string
): Promise<StaffSessionCommissionRule[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("staff_session_commission_rules")
    .select("*, service:services(id, name)")
    .eq("staff_id", staffId);
  if (error) throw error;
  return data ?? [];
}

export async function createStaffCommissionRule(
  values: StaffSessionCommissionRuleFormValues
): Promise<StaffSessionCommissionRule> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("staff_session_commission_rules")
    .insert(values)
    .select("*, service:services(id, name)")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStaffCommissionRule(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("staff_session_commission_rules")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function fetchStaffCommissionEarned(
  staffId: string,
  from: string,
  to: string
): Promise<StaffCommissionEarned[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("staff_commission_earned")
    .select("*")
    .eq("staff_id", staffId)
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
