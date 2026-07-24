// // Core domain types — mirror supabase-schema.sql exactly.
// // Regenerate with `supabase gen types typescript` once the project is linked;
// // this file is the hand-written source of truth until then.

// export type UserRole = "admin" | "doctor";
// export type EmploymentType = "fixed_salary" | "hourly";
// export type PaymentStatus = "pending" | "paid";
// export type SessionStatus = "scheduled" | "completed" | "cancelled";
// export type ExpenseCategory =
//   | "rent"
//   | "salaries"
//   | "utilities"
//   | "equipment"
//   | "supplies"
//   | "other";
// export type TransactionType = "income" | "expense";

// export interface AppUser {
//   id: string;
//   full_name: string;
//   role: UserRole;
//   doctor_id: string | null;
//   created_at: string;
// }

// export interface Department {
//   id: string;
//   name: string;
//   created_at: string;
// }

// export interface Service {
//   id: string;
//   name: string;
//   department_id: string;
//   selling_price: number;
//   doctor_base_price: number;
//   created_at: string;
// }

// export interface Doctor {
//   id: string;
//   name: string;
//   department_id: string;
//   phone: string | null;
//   commission_percentage: number;
//   employment_type: EmploymentType;
//   created_at: string;
// }

// export interface DoctorSalary {
//   id: string;
//   doctor_id: string;
//   monthly_salary: number | null;
//   hourly_rate: number | null;
//   working_hours: number | null;
//   effective_from: string;
//   created_at: string;
// }

// export interface Patient {
//   id: string;
//   name: string;
//   age: number | null;
//   phone: string | null;
//   notes: string | null;
//   created_at: string;
// }

// export interface PatientForm {
//   id: string;
//   form_number: string;
//   patient_id: string;
//   doctor_id: string;
//   department_id: string;
//   service_id: string;
//   diagnosis: string | null;
//   notes: string | null;
//   sessions_count: number;
//   completed_sessions: number;
//   customer_price: number;
//   doctor_base_price: number;
//   doctor_commission: number; // auto-calculated by DB trigger — never set manually
//   payment_status: PaymentStatus;
//   created_at: string;
// }

// export interface Session {
//   id: string;
//   form_id: string;
//   session_date: string;
//   status: SessionStatus;
//   notes: string | null;
//   created_at: string;
// }

// export interface CashTransaction {
//   id: string;
//   type: TransactionType;
//   amount: number;
//   description: string | null;
//   related_form_id: string | null;
//   related_expense_id: string | null;
//   transaction_date: string;
//   created_at: string;
// }

// export interface Expense {
//   id: string;
//   category: ExpenseCategory;
//   amount: number;
//   expense_date: string;
//   description: string | null;
//   created_at: string;
// }

// export interface DoctorCommission {
//   id: string;
//   doctor_id: string;
//   form_id: string;
//   commission_amount: number;
//   created_at: string;
// }

// // Derived/composite shapes used by dashboard & report queries
// export interface DashboardSummary {
//   today_revenue: number;
//   monthly_revenue: number;
//   total_patients: number;
//   total_forms: number;
//   total_doctors: number;
//   total_services: number;
//   total_expenses: number;
//   net_profit: number;
//   pending_payments: number;
//   doctor_commissions_total: number;
// }

// Core domain types — mirror supabase-schema.sql exactly.
// Regenerate with `supabase gen types typescript` once the project is linked;
// this file is the hand-written source of truth until then.

export type UserRole = "admin" | "doctor";
export type EmploymentType = "fixed_salary" | "hourly";
export type PaymentStatus = "pending" | "paid";
export type SessionStatus = "scheduled" | "completed" | "cancelled";
export type ExpenseCategory =
  | "rent"
  | "salaries"
  | "utilities"
  | "equipment"
  | "supplies"
  | "other";
export type TransactionType = "income" | "expense";

export interface AppUser {
  id: string;
  full_name: string;
  role: UserRole;
  doctor_id: string | null;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  department_id: string;
  selling_price: number;
  doctor_base_price: number;
  created_at: string;
}

export interface Doctor {
  id: string;
  name: string;
  department_id: string;
  phone: string | null;
  commission_percentage: number;
  employment_type: EmploymentType;
  created_at: string;
}

export interface DoctorSalary {
  id: string;
  doctor_id: string;
  monthly_salary: number | null;
  hourly_rate: number | null;
  working_hours: number | null;
  effective_from: string;
  created_at: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface PatientForm {
  id: string;
  form_number: string;
  patient_id: string;
  doctor_id: string;
  department_id: string;
  service_id: string;
  diagnosis: string | null;
  notes: string | null;
  sessions_count: number;
  completed_sessions: number;
  customer_price: number;
  doctor_base_price: number;
  doctor_commission: number; // auto-calculated by DB trigger — never set manually
  payment_status: PaymentStatus;
  created_at: string;
}

export interface Session {
  id: string;
  form_id: string;
  session_date: string;
  status: SessionStatus;
  notes: string | null;
  amount_paid: number;
  is_last_session: boolean;
  created_at: string;
}

export interface DoctorDailyLog {
  id: string;
  doctor_id: string;
  work_date: string;
  hours_worked: number;
  hourly_rate_snapshot: number;
  amount: number;
  created_at: string;
}

export interface CashTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  related_form_id: string | null;
  related_expense_id: string | null;
  transaction_date: string;
  created_at: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  description: string | null;
  created_at: string;
}

export interface DoctorCommission {
  id: string;
  doctor_id: string;
  form_id: string;
  commission_amount: number;
  created_at: string;
}

// Derived/composite shapes used by dashboard & report queries
export interface DashboardSummary {
  today_revenue: number;
  monthly_revenue: number;
  total_patients: number;
  total_forms: number;
  total_doctors: number;
  total_services: number;
  total_expenses: number;
  net_profit: number;
  pending_payments: number;
  doctor_commissions_total: number;
}