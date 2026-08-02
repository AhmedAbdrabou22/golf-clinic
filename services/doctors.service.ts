// services/doctors.service.ts
import { createClient } from "@/lib/supabase/client";
import type { DoctorFormValues } from "@/lib/validations/settings";

export interface DoctorWithDepartment {
  id: string;
  name: string;
  department_id: string;
  phone: string | null;
  commission_percentage: number;
  employment_type: "fixed_salary" | "hourly";
  created_at: string;
  department: {
    id: string;
    name: string;
  } | null;
  monthly_salary: number | null;
  hourly_rate: number | null;
  working_hours: number | null;
}

interface RawDoctorSalaryRow {
  monthly_salary: number | null;
  hourly_rate: number | null;
  working_hours: number | null;
  effective_from: string;
}

interface RawDoctorRow {
  id: string;
  name: string;
  department_id: string;
  phone: string | null;
  commission_percentage: number;
  employment_type: "fixed_salary" | "hourly";
  created_at: string;
  department: { id: string; name: string } | null;
  doctor_salary: RawDoctorSalaryRow[] | null;
}

const DOCTOR_SELECT = `
  id, name, department_id, phone, commission_percentage, employment_type, created_at,
  department:departments ( id, name ),
  doctor_salary ( monthly_salary, hourly_rate, working_hours, effective_from )
`;

function mapDoctor(row: RawDoctorRow): DoctorWithDepartment {
  const latestSalary = row.doctor_salary?.[0] ?? null;
  return {
    id: row.id,
    name: row.name,
    department_id: row.department_id,
    phone: row.phone,
    commission_percentage: row.commission_percentage,
    employment_type: row.employment_type,
    created_at: row.created_at,
    department: row.department,
    monthly_salary: latestSalary?.monthly_salary ?? null,
    hourly_rate: latestSalary?.hourly_rate ?? null,
    working_hours: latestSalary?.working_hours ?? null,
  };
}

export const doctorsService = {
  async getDoctors(): Promise<DoctorWithDepartment[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("doctors")
      .select(DOCTOR_SELECT)
      .order("effective_from", { foreignTable: "doctor_salary", ascending: false })
      .order("name");

    if (error) throw error;
    return (data as unknown as RawDoctorRow[]).map(mapDoctor);
  },

  async getDoctorById(id: string): Promise<DoctorWithDepartment> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("doctors")
      .select(DOCTOR_SELECT)
      .eq("id", id)
      .order("effective_from", { foreignTable: "doctor_salary", ascending: false })
      .single();

    if (error) throw error;
    return mapDoctor(data as unknown as RawDoctorRow);
  },

  async createDoctor(values: DoctorFormValues): Promise<void> {
    const supabase = createClient();

    const { data: doctor, error: doctorError } = await supabase
      .from("doctors")
      .insert({
        name: values.name,
        department_id: values.department_id,
        phone: values.phone,
        commission_percentage: values.commission_percentage,
        employment_type: values.employment_type,
      })
      .select("id")
      .single();

    if (doctorError) throw doctorError;

    const { error: salaryError } = await supabase.from("doctor_salary").insert({
      doctor_id: doctor.id,
      effective_from: new Date().toISOString().slice(0, 10),
      monthly_salary: values.employment_type === "fixed_salary" ? values.monthly_salary : null,
      hourly_rate: values.employment_type === "hourly" ? values.hourly_rate : null,
      working_hours: values.employment_type === "hourly" ? values.working_hours : null,
    });

    if (salaryError) throw salaryError;
  },

  async updateDoctor(id: string, values: DoctorFormValues): Promise<void> {
    const supabase = createClient();

    const { error: doctorError } = await supabase
      .from("doctors")
      .update({
        name: values.name,
        department_id: values.department_id,
        phone: values.phone,
        commission_percentage: values.commission_percentage,
        employment_type: values.employment_type,
      })
      .eq("id", id);

    if (doctorError) throw doctorError;

    // صف جديد بتاريخ سريان النهاردة — بيحافظ على تاريخ الأجور القديم
    const { error: salaryError } = await supabase.from("doctor_salary").insert({
      doctor_id: id,
      effective_from: new Date().toISOString().slice(0, 10),
      monthly_salary: values.employment_type === "fixed_salary" ? values.monthly_salary : null,
      hourly_rate: values.employment_type === "hourly" ? values.hourly_rate : null,
      working_hours: values.employment_type === "hourly" ? values.working_hours : null,
    });

    if (salaryError) throw salaryError;
  },

  async deleteDoctor(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (error) throw error;
  },
};