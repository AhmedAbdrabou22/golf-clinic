import { z } from "zod";

export const doctorPayoutSchema = z.object({
  salaryAmount: z.coerce
    .number()
    .min(0, "قيمة المرتب غير صحيحة"),

  commissionAmount: z.coerce
    .number()
    .min(0, "قيمة العمولات غير صحيحة"),

  deductions: z.coerce
    .number()
    .min(0, "قيمة الخصومات غير صحيحة")
    .default(0),

  bonuses: z.coerce
    .number()
    .min(0, "قيمة المكافآت غير صحيحة")
    .default(0),

  notes: z
    .string()
    .max(500, "الملاحظات لا يجب أن تزيد عن 500 حرف")
    .optional(),
}).refine(
  (data) =>
    data.salaryAmount + data.commissionAmount - data.deductions + data.bonuses > 0,
  {
    message: "إجمالي الصرف يجب أن يكون أكبر من صفر",
    path: ["deductions"],
  }
);

export type DoctorPayoutFormValues = z.infer<typeof doctorPayoutSchema>;