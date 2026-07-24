import { createClient } from "@/lib/supabase/client";
import type { CashTransaction, Expense, ExpenseCategory } from "@/types/database.types";

const supabase = createClient();

export type CashTransactionWithRelations = CashTransaction & {
  related_form: { form_number: string } | null;
  related_expense: { category: ExpenseCategory } | null;
};

export async function getCashTransactions(): Promise<CashTransactionWithRelations[]> {
  const { data, error } = await supabase
    .from("cash_transactions")
    .select("*, related_form:patient_forms(form_number), related_expense:expenses(category)")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as CashTransactionWithRelations[];
}

// Balance is never stored — always derived from the transaction log (per spec)
export async function getCashBalance(): Promise<number> {
  const { data, error } = await supabase.from("cash_transactions").select("type, amount");
  if (error) throw error;

  return data.reduce(
    (balance, tx) => (tx.type === "income" ? balance + tx.amount : balance - tx.amount),
    0
  );
}

export interface ExpenseInput {
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  description?: string | null;
}

export async function createExpense(values: ExpenseInput): Promise<Expense> {
  const { data: expense, error } = await supabase
    .from("expenses")
    .insert(values)
    .select()
    .single();
  if (error) throw error;

  // Expenses are never counted twice — this is the single cash_transactions
  // entry that both the cashbox feed and the balance calc rely on.
  const { error: txError } = await supabase.from("cash_transactions").insert({
    type: "expense",
    amount: values.amount,
    description: values.description,
    related_expense_id: expense.id,
    transaction_date: values.expense_date,
  });
  if (txError) throw txError;

  return expense;
}

export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false });
  if (error) throw error;
  return data;
}
