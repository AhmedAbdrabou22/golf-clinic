import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("إيميل غير صحيح"),
  password: z.string().min(6, "الباسورد لازم يكون 6 أحرف على الأقل"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;
