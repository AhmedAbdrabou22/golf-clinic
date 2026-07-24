import { createClient } from "@/lib/supabase/client";
import type { DashboardSummary } from "@/types/database.types";

const supabase = createClient();

function startOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [
    todayIncome,
    monthIncome,
    patientsCount,
    formsCount,
    doctorsCount,
    servicesCount,
    monthExpenses,
    pendingForms,
    monthCommissions,
  ] = await Promise.all([
    supabase
      .from("cash_transactions")
      .select("amount")
      .eq("type", "income")
      .eq("transaction_date", today()),
    supabase
      .from("cash_transactions")
      .select("amount")
      .eq("type", "income")
      .gte("transaction_date", startOfMonth()),
    supabase.from("patients").select("id", { count: "exact", head: true }),
    supabase.from("patient_forms").select("id", { count: "exact", head: true }),
    supabase.from("doctors").select("id", { count: "exact", head: true }),
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("expenses").select("amount").gte("expense_date", startOfMonth()),
    supabase
      .from("patient_forms")
      .select("customer_price")
      .eq("payment_status", "pending"),
    supabase
      .from("doctor_commissions")
      .select("commission_amount, created_at")
      .gte("created_at", startOfMonth()),
  ]);

  const sum = (rows: { amount?: number; customer_price?: number; commission_amount?: number }[] | null, key: string) =>
    (rows ?? []).reduce((acc: number, row: any) => acc + Number(row[key] ?? 0), 0);

  const monthlyRevenue = sum(monthIncome.data, "amount");
  const monthlyExpenses = sum(monthExpenses.data, "amount");
  const monthlyCommissions = sum(monthCommissions.data, "commission_amount");

  return {
    today_revenue: sum(todayIncome.data, "amount"),
    monthly_revenue: monthlyRevenue,
    total_patients: patientsCount.count ?? 0,
    total_forms: formsCount.count ?? 0,
    total_doctors: doctorsCount.count ?? 0,
    total_services: servicesCount.count ?? 0,
    total_expenses: monthlyExpenses,
    net_profit: monthlyRevenue - monthlyExpenses - monthlyCommissions,
    pending_payments: sum(pendingForms.data, "customer_price"),
    doctor_commissions_total: monthlyCommissions,
  };
}
