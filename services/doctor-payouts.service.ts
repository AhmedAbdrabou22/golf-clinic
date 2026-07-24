import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type DoctorPendingDues = {
  doctorId: string;
  doctorName: string;
  employmentType: "fixed_salary" | "hourly";
  salaryAmount: number;
  commissionAmount: number;
  totalBeforeAdjustments: number;
};

export interface DisburseDoctorPayoutInput {
  doctorId: string;
  salaryAmount: number;
  commissionAmount: number;
  deductions: number;
  bonuses: number;
  notes?: string;
}

export async function getDoctorPendingDues(
  doctorId: string
): Promise<DoctorPendingDues> {
  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select("id,name,employment_type")
    .eq("id", doctorId)
    .single();

  if (doctorError) throw doctorError;

  let salaryAmount = 0;

  // الدكتور ثابت
  if (doctor.employment_type === "fixed_salary") {
    const { data: salary, error } = await supabase
      .from("doctor_salary")
      .select("monthly_salary")
      .eq("doctor_id", doctorId)
      .order("effective_from", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    salaryAmount = Number(salary.monthly_salary ?? 0);
  }

  // الدكتور بالساعة
  else {
    const { data: logs, error } = await supabase
      .from("doctor_daily_logs")
      .select("amount")
      .eq("doctor_id", doctorId)
      .is("payout_id", null);

    if (error) throw error;

    salaryAmount = (logs ?? []).reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );
  }

  const { data: commissions, error: commissionError } = await supabase
    .from("doctor_commissions")
    .select("commission_amount")
    .eq("doctor_id", doctorId)
    .is("payout_id", null);

  if (commissionError) throw commissionError;

  const commissionAmount = (commissions ?? []).reduce(
    (sum, item) => sum + Number(item.commission_amount),
    0
  );

  return {
    doctorId: doctor.id,
    doctorName: doctor.name,
    employmentType: doctor.employment_type,
    salaryAmount,
    commissionAmount,
    totalBeforeAdjustments: salaryAmount + commissionAmount,
  };
}

// export async function disburseDoctorPayout(
//   values: DisburseDoctorPayoutInput
// ) {
//   const totalAmount =
//     values.salaryAmount +
//     values.commissionAmount -
//     values.deductions +
//     values.bonuses;

//   if (totalAmount < 0) {
//     throw new Error("إجمالي الصرف لا يمكن أن يكون أقل من صفر");
//   }

//   const { data: payout, error: payoutError } = await supabase
//     .from("doctor_payouts")
//     .insert({
//       doctor_id: values.doctorId,
//       salary_amount: values.salaryAmount,
//       commission_amount: values.commissionAmount,
//       deductions: values.deductions,
//       bonuses: values.bonuses,
//       total_amount: totalAmount,
//       notes: values.notes || null,
//     })
//     .select("id")
//     .single();

//   if (payoutError) throw payoutError;

//   // ربط العمولات
//   const { error: commissionUpdateError } = await supabase
//     .from("doctor_commissions")
//     .update({
//       payout_id: payout.id,
//     })
//     .eq("doctor_id", values.doctorId)
//     .is("payout_id", null);

//   if (commissionUpdateError) throw commissionUpdateError;

//   // معرفة نوع الدكتور
//   const { data: doctor } = await supabase
//     .from("doctors")
//     .select("employment_type")
//     .eq("id", values.doctorId)
//     .single();

//   // ربط الساعات لو الدكتور hourly
//   if (doctor?.employment_type === "hourly") {
//     const { error: logsError } = await supabase
//       .from("doctor_daily_logs")
//       .update({
//         payout_id: payout.id,
//       })
//       .eq("doctor_id", values.doctorId)
//       .is("payout_id", null);

//     if (logsError) throw logsError;
//   }

//   return {
//     id: payout.id,
//     totalAmount,
//   };
// }

export async function disburseDoctorPayout(
  values: DisburseDoctorPayoutInput
) {
  const { data, error } = await supabase.rpc("disburse_doctor_payout", {
    p_doctor_id: values.doctorId,
    p_salary_amount: values.salaryAmount,
    p_commission_amount: values.commissionAmount,
    p_deductions: values.deductions,
    p_bonuses: values.bonuses,
    p_notes: values.notes ?? null,
  });

//   if (error) throw error;
  if (error) throw error;

if (!data) {
  throw new Error("فشل تنفيذ عملية الصرف");
}

  return {
    id: data,
    totalAmount:
      values.salaryAmount +
      values.commissionAmount -
      values.deductions +
      values.bonuses,
  };
}