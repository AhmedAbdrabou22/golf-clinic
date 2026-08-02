import { z } from "zod";

export const medicationSchema = z.object({
  name: z.string().min(2, "اسم الدواء لازم يكون حرفين على الأقل"),
  selling_price: z.coerce.number().min(0, "السعر لازم يكون صفر أو أكبر"),
});
export type MedicationFormValues = z.infer<typeof medicationSchema>;

export const medicationSaleSchema = z.object({
  medication_id: z.string().uuid({ message: "اختار الدواء" }),
  patient_id: z.string().uuid().optional().nullable(),
  quantity: z.coerce.number().int().min(1, "الكمية لازم تكون 1 على الأقل"),
  sale_date: z.string().min(1, "اختار التاريخ"),
});
export type MedicationSaleFormValues = z.infer<typeof medicationSaleSchema>;

export const medicationCommissionRecipientSchema = z.object({
  staff_id: z.string().uuid({ message: "اختار الموظفة" }),
  amount_per_unit: z.coerce.number().min(0, "المبلغ لازم يكون صفر أو أكبر"),
});
export type MedicationCommissionRecipientFormValues = z.infer<
  typeof medicationCommissionRecipientSchema
>;
