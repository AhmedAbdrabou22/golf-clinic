import { z } from "zod";

// export const departmentSchema = z.object({
//   name: z.string().min(2, "اسم القسم لازم يكون حرفين على الأقل"),
// });
// export type DepartmentFormValues = z.infer<typeof departmentSchema>;

// export const serviceSchema = z.object({
//   name: z.string().min(2, "اسم الخدمة مطلوب"),
//   department_id: z.string().uuid("اختر قسم"),
//   selling_price: z.coerce.number().min(0, "السعر لازم يكون 0 أو أكتر"),
//   doctor_base_price: z.coerce.number().min(0, "السعر لازم يكون 0 أو أكتر"),
// });
// export type ServiceFormValues = z.infer<typeof serviceSchema>;

// export const doctorSchema = z
//   .object({
//     name: z.string().min(2, "اسم الدكتور مطلوب"),
//     department_id: z.string().uuid("اختر قسم"),
//     phone: z.string().optional().or(z.literal("")),
//     commission_percentage: z.coerce.number().min(0).max(100),
//     employment_type: z.enum(["fixed_salary", "hourly"]),
//     monthly_salary: z.coerce.number().min(0).optional().nullable(),
//     hourly_rate: z.coerce.number().min(0).optional().nullable(),
//     working_hours: z.coerce.number().min(0).optional().nullable(),
//   })
//   .refine(
//     (data) => data.employment_type !== "fixed_salary" || !!data.monthly_salary,
//     { message: "المرتب الشهري مطلوب", path: ["monthly_salary"] }
//   )
//   .refine(
//     (data) => data.employment_type !== "hourly" || !!data.hourly_rate,
//     { message: "سعر الساعة مطلوب", path: ["hourly_rate"] }
//   );
// export type DoctorFormValues = z.infer<typeof doctorSchema>;

// export const expenseSchema = z.object({
//   category: z.enum(["rent", "salaries", "utilities", "equipment", "supplies", "other"]),
//   amount: z.coerce.number().positive("المبلغ لازم يكون أكبر من صفر"),
//   expense_date: z.string().min(1, "التاريخ مطلوب"),
//   description: z.string().optional().nullable(),
// });
// export type ExpenseFormValues = z.infer<typeof expenseSchema>;

// export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
//   rent: "إيجار",
//   salaries: "مرتبات",
//   utilities: "مرافق",
//   equipment: "معدات",
//   supplies: "مستلزمات",
//   other: "أخرى",
// };


export const departmentSchema = z.object({
  name: z.string().min(2, "اسم القسم لازم يكون حرفين على الأقل"),
});
export type DepartmentFormValues = z.infer<typeof departmentSchema>;

export const serviceSchema = z.object({
  name: z.string().min(2, "اسم الخدمة مطلوب"),
  department_id: z.string().uuid("اختر قسم"),
  selling_price: z.coerce.number().min(0, "السعر لازم يكون 0 أو أكتر"),
  doctor_base_price: z.coerce.number().min(0, "السعر لازم يكون 0 أو أكتر"),
});
export type ServiceFormValues = z.infer<typeof serviceSchema>;

// export const doctorSchema = z
//   .object({
//     name: z.string().min(2, "اسم الدكتور مطلوب"),
//     department_id: z.string().uuid("اختر قسم"),
//     phone: z.string().optional().or(z.literal("")),
//     commission_percentage: z.coerce.number().min(0).max(100),
//     employment_type: z.enum(["fixed_salary", "hourly"]),
//     monthly_salary: z.coerce.number().min(0).optional().nullable(),
//     hourly_rate: z.coerce.number().min(0).optional().nullable(),
//     working_hours: z.coerce.number().min(0).optional().nullable(),
//   })
//   .refine(
//     (data) => data.employment_type !== "fixed_salary" || !!data.monthly_salary,
//     { message: "المرتب الشهري مطلوب", path: ["monthly_salary"] }
//   )
//   .refine(
//     (data) => data.employment_type !== "hourly" || !!data.hourly_rate,
//     { message: "سعر الساعة مطلوب", path: ["hourly_rate"] }
//   );
// export type DoctorFormValues = z.infer<typeof doctorSchema>;

export const expenseSchema = z.object({
  category: z.enum(["rent", "salaries", "utilities", "equipment", "supplies", "other"]),
  amount: z.coerce.number().positive("المبلغ لازم يكون أكبر من صفر"),
  expense_date: z.string().min(1, "التاريخ مطلوب"),
  description: z.string().optional().nullable(),
});
export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  rent: "إيجار",
  salaries: "مرتبات",
  utilities: "مرافق",
  equipment: "معدات",
  supplies: "مستلزمات",
  other: "أخرى",
};

export const attendanceSchema = z.object({
  work_date: z.string().min(1, "التاريخ مطلوب"),
  hours_worked: z.coerce.number().positive("عدد الساعات لازم يكون أكبر من صفر").max(24),
});
export type AttendanceFormValues = z.infer<typeof attendanceSchema>;
export const doctorSchema = z
  .object({
    name: z.string().min(2, "اسم الدكتور مطلوب"),

    department_id: z.string().uuid("اختر قسم"),

    phone: z.string().optional().or(z.literal("")),

    /**
     * Legacy
     * هنسيبه مؤقتًا لحد ما ننقل كل الحسابات
     */
    commission_percentage: z.coerce.number().min(0).max(100).default(0),

    /**
     * NEW
     */
    monthly_target: z.coerce.number().min(0).optional().nullable(),

    hourly_rate: z.coerce.number().min(0).optional().nullable(),

    employment_type: z.enum([
      "fixed_salary",
      "hourly",
    ]),

    monthly_salary: z.coerce
      .number()
      .min(0)
      .optional()
      .nullable(),

    working_hours: z.coerce
      .number()
      .min(0)
      .optional()
      .nullable(),

    /**
     * Multiple commissions
     */
    commissions: z
      .array(
        z.object({
          service_category_id: z.string().uuid(),

          commission_percentage: z.coerce
            .number()
            .min(0)
            .max(100),

          target_amount: z.coerce
            .number()
            .min(0)
            .nullable()
            .optional(),

          target_commission_percentage: z.coerce
            .number()
            .min(0)
            .max(100)
            .nullable()
            .optional(),
        })
      )
      .default([]),
  })
  .refine(
    (data) =>
      data.employment_type !== "fixed_salary" ||
      !!data.monthly_salary,
    {
      message: "المرتب الشهري مطلوب",
      path: ["monthly_salary"],
    }
  )
  .refine(
    (data) =>
      data.employment_type !== "hourly" ||
      !!data.hourly_rate,
    {
      message: "سعر الساعة مطلوب",
      path: ["hourly_rate"],
    }
  );

export type DoctorFormValues = z.infer<
  typeof doctorSchema
>;