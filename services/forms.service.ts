// import { createClient } from "@/lib/supabase/client";
// import type { PatientForm, Session } from "@/types/database.types";
// import type { PatientVisitFormValues } from "@/lib/validations/patient";

// const supabase = createClient();

// // Joined shape used by list/detail views — avoids N+1 lookups in the UI
// export type PatientFormWithRelations = PatientForm & {
//   patient: { id: string; name: string; phone: string | null };
//   doctor: { id: string; name: string };
//   department: { id: string; name: string };
//   service: { id: string; name: string };
//   sessions: Session[];
// };

// const FORM_SELECT = `
//   *,
//   patient:patients(id, name, phone),
//   doctor:doctors(id, name),
//   department:departments(id, name),
//   service:services(id, name),
//   sessions(*)
// `;

// export async function getFormsByPatient(patientId: string): Promise<PatientFormWithRelations[]> {
//   const { data, error } = await supabase
//     .from("patient_forms")
//     .select(FORM_SELECT)
//     .eq("patient_id", patientId)
//     .order("created_at", { ascending: false });
//   if (error) throw error;
//   return data as unknown as PatientFormWithRelations[];
// }

// export async function getFormById(id: string): Promise<PatientFormWithRelations> {
//   const { data, error } = await supabase
//     .from("patient_forms")
//     .select(FORM_SELECT)
//     .eq("id", id)
//     .single();
//   if (error) throw error;
//   return data as unknown as PatientFormWithRelations;
// }

// export async function searchForms(query: string): Promise<PatientFormWithRelations[]> {
//   // Global search per spec: patient name, doctor, phone, form number, service, department
//   const { data, error } = await supabase
//     .from("patient_forms")
//     .select(FORM_SELECT)
//     .or(`form_number.ilike.%${query}%`)
//     .order("created_at", { ascending: false })
//     .limit(50);
//   if (error) throw error;
//   return data as unknown as PatientFormWithRelations[];
// }

// export async function createPatientForm(
//   patientId: string,
//   values: PatientVisitFormValues
// ): Promise<PatientForm> {
//   // doctor_commission is computed server-side by trg_calc_commission — never sent from client
//   const { data, error } = await supabase
//     .from("patient_forms")
//     .insert({ ...values, patient_id: patientId })
//     .select()
//     .single();
//   if (error) throw error;
//   return data;
// }

// export async function updatePatientForm(
//   id: string,
//   values: Partial<PatientVisitFormValues>
// ): Promise<PatientForm> {
//   const { data, error } = await supabase
//     .from("patient_forms")
//     .update(values)
//     .eq("id", id)
//     .select()
//     .single();
//   if (error) throw error;
//   return data;
// }

// // Marking as paid only flips the status column. The DB trigger (trg_form_paid)
// // then creates the cash transaction + commission record automatically.
// export async function markFormAsPaid(id: string): Promise<PatientForm> {
//   const { data, error } = await supabase
//     .from("patient_forms")
//     .update({ payment_status: "paid" })
//     .eq("id", id)
//     .select()
//     .single();
//   if (error) throw error;
//   return data;
// }

// export async function addSession(formId: string, sessionDate: string, notes?: string) {
//   const { data, error } = await supabase
//     .from("sessions")
//     .insert({ form_id: formId, session_date: sessionDate, notes })
//     .select()
//     .single();
//   if (error) throw error;
//   return data as Session;
// }

// export async function completeSession(sessionId: string, formId: string) {
//   const { error: sessionError } = await supabase
//     .from("sessions")
//     .update({ status: "completed" })
//     .eq("id", sessionId);
//   if (sessionError) throw sessionError;

//   // Keep patient_forms.completed_sessions in sync
//   const { data: form, error: formError } = await supabase
//     .from("patient_forms")
//     .select("completed_sessions")
//     .eq("id", formId)
//     .single();
//   if (formError) throw formError;

//   const { error: updateError } = await supabase
//     .from("patient_forms")
//     .update({ completed_sessions: form.completed_sessions + 1 })
//     .eq("id", formId);
//   if (updateError) throw updateError;
// }

import { createClient } from "@/lib/supabase/client";
import type { PatientForm, Session } from "@/types/database.types";
import type { PatientVisitFormValues } from "@/lib/validations/patient";

const supabase = createClient();

// Joined shape used by list/detail views — avoids N+1 lookups in the UI
export type PatientFormWithRelations = PatientForm & {
  patient: { id: string; name: string; phone: string | null };
  doctor: { id: string; name: string };
  department: { id: string; name: string };
  service: { id: string; name: string };
  sessions: Session[];
};

const FORM_SELECT = `
  *,
  patient:patients(id, name, phone),
  doctor:doctors(id, name),
  department:departments(id, name),
  service:services(id, name),
  sessions(*)
`;

export async function getFormsByPatient(patientId: string): Promise<PatientFormWithRelations[]> {
  const { data, error } = await supabase
    .from("patient_forms")
    .select(FORM_SELECT)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as PatientFormWithRelations[];
}

export async function getFormById(id: string): Promise<PatientFormWithRelations> {
  const { data, error } = await supabase
    .from("patient_forms")
    .select(FORM_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as PatientFormWithRelations;
}

export async function searchForms(query: string): Promise<PatientFormWithRelations[]> {
  // Global search per spec: patient name, doctor, phone, form number, service, department
  const { data, error } = await supabase
    .from("patient_forms")
    .select(FORM_SELECT)
    .or(`form_number.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as unknown as PatientFormWithRelations[];
}

export async function createPatientForm(
  patientId: string,
  values: PatientVisitFormValues
): Promise<PatientForm> {
  // doctor_commission is computed server-side by trg_calc_commission — never sent from client
  const { data, error } = await supabase
    .from("patient_forms")
    .insert({ ...values, patient_id: patientId })
    .select()
    .single();
  if (error) throw error;

  // First session is scheduled for today by default — admin can complete it right away
  await addSession(data.id, new Date().toISOString().split("T")[0]);

  return data;
}

export async function updatePatientForm(
  id: string,
  values: Partial<PatientVisitFormValues>
): Promise<PatientForm> {
  const { data, error } = await supabase
    .from("patient_forms")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Marking as paid only flips the status column. The DB trigger (trg_form_paid)
// then creates the cash transaction + commission record automatically.
export async function markFormAsPaid(id: string): Promise<PatientForm> {
  const { data, error } = await supabase
    .from("patient_forms")
    .update({ payment_status: "paid" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addSession(formId: string, sessionDate: string, notes?: string) {
  const { data, error } = await supabase
    .from("sessions")
    .insert({ form_id: formId, session_date: sessionDate, notes })
    .select()
    .single();
  if (error) throw error;
  return data as Session;
}

export interface CompleteSessionInput {
  amountPaid: number;
  isLastSession: boolean;
  nextAppointmentDate?: string; // required when isLastSession is false
}

// Completes a session with a partial (or final) payment.
// - Always records a cash income transaction for the exact amount collected.
// - If isLastSession: forces the payment to the true remaining balance (never
//   trusts the client-entered amount for this), flips the form to "paid",
//   and caps sessions_count at however many sessions were actually used.
// - Otherwise: schedules the next appointment as a new "scheduled" session.
export async function completeSessionWithPayment(
  sessionId: string,
  formId: string,
  input: CompleteSessionInput
): Promise<{ amountCharged: number }> {
  const { data: form, error: formError } = await supabase
    .from("patient_forms")
    .select("customer_price, completed_sessions")
    .eq("id", formId)
    .single();
  if (formError) throw formError;

  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("amount_paid")
    .eq("form_id", formId);
  if (sessionsError) throw sessionsError;

  const paidSoFar = sessions.reduce((sum, s) => sum + Number(s.amount_paid ?? 0), 0);
  const remaining = Number(form.customer_price) - paidSoFar;

  // Last session always charges exactly what's left — never a client-supplied number
  const amountCharged = input.isLastSession
    ? Math.max(remaining, 0)
    : input.amountPaid;

  const { error: sessionUpdateError } = await supabase
    .from("sessions")
    .update({
      status: "completed",
      amount_paid: amountCharged,
      is_last_session: input.isLastSession,
    })
    .eq("id", sessionId);
  if (sessionUpdateError) throw sessionUpdateError;

  if (amountCharged > 0) {
    const { error: txError } = await supabase.from("cash_transactions").insert({
      type: "income",
      amount: amountCharged,
      description: input.isLastSession ? "دفعة الجلسة الأخيرة" : "دفعة جلسة",
      related_form_id: formId,
      transaction_date: new Date().toISOString().split("T")[0],
    });
    if (txError) throw txError;
  }

  const newCompletedSessions = form.completed_sessions + 1;

  const { error: formUpdateError } = await supabase
    .from("patient_forms")
    .update({
      completed_sessions: newCompletedSessions,
      ...(input.isLastSession
        ? { payment_status: "paid", sessions_count: newCompletedSessions }
        : {}),
    })
    .eq("id", formId);
  if (formUpdateError) throw formUpdateError;

  if (!input.isLastSession && input.nextAppointmentDate) {
    await addSession(formId, input.nextAppointmentDate);
  }

  return { amountCharged };
}