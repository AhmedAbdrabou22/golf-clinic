import { z } from "zod";

export const commissionCategorySchema = z.object({
  name: z.string().min(2, "اسم التصنيف لازم يكون حرفين على الأقل"),
});
export type CommissionCategoryFormValues = z.infer<typeof commissionCategorySchema>;

export const doctorCommissionRateSchema = z.object({
  doctor_id: z.string().uuid(),
  commission_category_id: z.string().uuid({ message: "اختار التصنيف" }),
  percentage: z.coerce
    .number()
    .min(0, "النسبة لازم تكون بين 0 و 100")
    .max(100, "النسبة لازم تكون بين 0 و 100"),
  effective_from: z.string().min(1, "اختار تاريخ السريان"),
});
export type DoctorCommissionRateFormValues = z.infer<typeof doctorCommissionRateSchema>;

export const doctorTargetBonusSchema = z.object({
  doctor_id: z.string().uuid(),
  monthly_target_sessions: z.coerce
    .number()
    .int()
    .min(1, "التارجت لازم يكون رقم أكبر من صفر"),
  bonus_hourly_rate: z.coerce.number().min(0).optional().nullable(),
  bonus_commission_percentage: z.coerce
    .number()
    .min(0, "النسبة لازم تكون بين 0 و 100")
    .max(100, "النسبة لازم تكون بين 0 و 100"),
  is_active: z.boolean().default(true),
});
export type DoctorTargetBonusFormValues = z.infer<typeof doctorTargetBonusSchema>;
