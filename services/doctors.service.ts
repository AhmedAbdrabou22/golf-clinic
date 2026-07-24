import { createClient } from "@/lib/supabase/client";
import type { Doctor, EmploymentType } from "@/types/database.types";

const supabase = createClient();

export type DoctorWithDepartment = Doctor & { department: { name: string } };

export async function getDoctors(): Promise<DoctorWithDepartment[]> {
  const { data, error } = await supabase
    .from("doctors")
    .select("*, department:departments(name)")
    .order("name");
  if (error) throw error;
  return data as unknown as DoctorWithDepartment[];
}

export interface DoctorInput {
  name: string;
  department_id: string;
  phone?: string | null;
  commission_percentage: number;
  employment_type: EmploymentType;
  monthly_salary?: number | null;
  hourly_rate?: number | null;
  working_hours?: number | null;
}

export async function createDoctor(values: DoctorInput): Promise<Doctor> {
  const { monthly_salary, hourly_rate, working_hours, ...doctorFields } = values;

  const { data: doctor, error } = await supabase
    .from("doctors")
    .insert(doctorFields)
    .select()
    .single();
  if (error) throw error;

  if (values.employment_type === "fixed_salary" || values.employment_type === "hourly") {
    const { error: salaryError } = await supabase.from("doctor_salary").insert({
      doctor_id: doctor.id,
      monthly_salary: monthly_salary ?? null,
      hourly_rate: hourly_rate ?? null,
      working_hours: working_hours ?? null,
    });
    if (salaryError) throw salaryError;
  }

  return doctor;
}

export async function updateDoctor(id: string, values: DoctorInput): Promise<Doctor> {
  const { monthly_salary, hourly_rate, working_hours, ...doctorFields } = values;

  const { data: doctor, error } = await supabase
    .from("doctors")
    .update(doctorFields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  // Insert a new salary record (history is preserved — see doctor_salary.effective_from)
  const { error: salaryError } = await supabase.from("doctor_salary").insert({
    doctor_id: id,
    monthly_salary: monthly_salary ?? null,
    hourly_rate: hourly_rate ?? null,
    working_hours: working_hours ?? null,
  });
  if (salaryError) throw salaryError;

  return doctor;
}

export async function deleteDoctor(id: string): Promise<void> {
  const { error } = await supabase.from("doctors").delete().eq("id", id);
  if (error) throw error;
}
