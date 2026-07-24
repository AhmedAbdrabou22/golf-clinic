// import { z } from "zod";

// export const patientSchema = z.object({
//   name: z.string().min(2, "الاسم لازم يكون حرفين على الأقل"),
//   age: z.coerce.number().int().min(0).max(120).optional().nullable(),
//   phone: z
//     .string()
//     .regex(/^01[0-2,5]{1}[0-9]{8}$/, "رقم تليفون غير صحيح")
//     .optional()
//     .or(z.literal("")),
//   notes: z.string().optional().nullable(),
// });
// export type PatientFormValues = z.infer<typeof patientSchema>;

// export const patientVisitFormSchema = z
//   .object({
//     // patient_id: z.string().uuid("اختر مريض"),
//     doctor_id: z.string().uuid("اختر دكتور"),
//     department_id: z.string().uuid("اختر قسم"),
//     service_id: z.string().uuid("اختر خدمة"),
//     diagnosis: z.string().optional().nullable(),
//     notes: z.string().optional().nullable(),
//     sessions_count: z.coerce.number().int().min(1, "لازم جلسة واحدة على الأقل"),
//     completed_sessions: z.coerce.number().int().min(0).default(0),
//     customer_price: z.coerce.number().min(0),
//     doctor_base_price: z.coerce.number().min(0),
//     payment_status: z.enum(["pending", "paid"]).default("pending"),
//   })
//   .refine((data) => data.completed_sessions <= data.sessions_count, {
//     message: "الجلسات المنجزة لا يمكن أن تتخطى إجمالي الجلسات",
//     path: ["completed_sessions"],
//   });
// export type PatientVisitFormValues = z.infer<typeof patientVisitFormSchema>;

import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "الاسم لازم يكون حرفين على الأقل"),
  age: z.coerce.number().int().min(0).max(120).optional().nullable(),
  phone: z
    .string()
    .regex(/^01[0-2,5]{1}[0-9]{8}$/, "رقم تليفون غير صحيح")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional().nullable(),
});
export type PatientFormValues = z.infer<typeof patientSchema>;

export const patientVisitFormSchema = z
  .object({
    // patient_id: z.string().uuid("اختر مريض"),
    doctor_id: z.string().uuid("اختر دكتور"),
    department_id: z.string().uuid("اختر قسم"),
    service_id: z.string().uuid("اختر خدمة"),
    diagnosis: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    sessions_count: z.coerce.number().int().min(1, "لازم جلسة واحدة على الأقل"),
    completed_sessions: z.coerce.number().int().min(0).default(0),
    customer_price: z.coerce.number().min(0),
    doctor_base_price: z.coerce.number().min(0),
    payment_status: z.enum(["pending", "paid"]).default("pending"),
  })
  .refine((data) => data.completed_sessions <= data.sessions_count, {
    message: "الجلسات المنجزة لا يمكن أن تتخطى إجمالي الجلسات",
    path: ["completed_sessions"],
  });
export type PatientVisitFormValues = z.infer<typeof patientVisitFormSchema>;

export const completeSessionSchema = z
  .object({
    amount_paid: z.coerce.number().min(0, "المبلغ لازم يكون 0 أو أكتر"),
    is_last_session: z.boolean().default(false),
    next_appointment_date: z.string().optional(),
  })
  .refine(
    (data) => data.is_last_session || !!data.next_appointment_date,
    {
      message: "حدد معاد الجلسة الجاية أو اعلّم إنها آخر جلسة",
      path: ["next_appointment_date"],
    }
  );
export type CompleteSessionFormValues = z.infer<typeof completeSessionSchema>;