import { z } from "zod";

export const reportPeriodSchema = z.enum(["daily", "weekly", "monthly"]);
export type ReportPeriodValue = z.infer<typeof reportPeriodSchema>;

export const doctorReportFilterSchema = z.object({
  period: reportPeriodSchema,
  referenceDate: z.string().min(1, "التاريخ مطلوب"),
  doctorId: z.string().uuid().optional(),
});
export type DoctorReportFilter = z.infer<typeof doctorReportFilterSchema>;
