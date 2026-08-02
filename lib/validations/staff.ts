import { z } from "zod";

export const STAFF_ROLE_LABELS: Record<string, string> = {
  reception: "ريسبشن",
  assistant: "مسات",
  sterilization: "تعقيم",
  nursing: "تمريض",
};

export const STAFF_ROLES = ["reception", "assistant", "sterilization", "nursing"] as const;

export const staffSchema = z.object({
  name: z.string().min(2, "الاسم لازم يكون حرفين على الأقل"),
  role: z.enum(STAFF_ROLES, { errorMap: () => ({ message: "اختار الدور" }) }),
  monthly_salary: z.coerce.number().min(0).optional().nullable(),
  phone: z.string().optional().nullable(),
});
export type StaffFormValues = z.infer<typeof staffSchema>;

export const staffSessionCommissionRuleSchema = z.object({
  staff_id: z.string().uuid(),
  service_id: z.string().uuid({ message: "اختار الخدمة" }),
  amount_per_session: z.coerce.number().min(0, "المبلغ لازم يكون صفر أو أكبر"),
});
export type StaffSessionCommissionRuleFormValues = z.infer<
  typeof staffSessionCommissionRuleSchema
>;
