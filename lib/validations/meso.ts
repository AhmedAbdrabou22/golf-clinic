import { z } from "zod";

export const mesoProductSchema = z.object({
  name: z.string().min(1, "اسم المنتج مطلوب"),
  company: z.string().optional().nullable(),
  price_half_ml: z.coerce.number().min(0).optional().nullable(),
  price_1ml: z.coerce.number().min(0).optional().nullable(),
});
export type MesoProductFormValues = z.infer<typeof mesoProductSchema>;

// كميات شائعة الاستخدام في الجلسة الواحدة (تقدر تدخل أي رقم تاني يدويًا برضو)
export const MESO_QUANTITY_PRESETS = [0.25, 0.5, 0.75, 1, 1.5, 2] as const;

export const mesoLineSchema = z.object({
  form_id: z.string().uuid(),
  meso_product_id: z.string().uuid({ message: "اختار المنتج" }),
  quantity_ml: z.coerce.number().positive("الكمية لازم تكون أكبر من صفر"),
  price: z.coerce.number().min(0, "السعر لازم يكون صفر أو أكبر"),
});
export type MesoLineFormValues = z.infer<typeof mesoLineSchema>;

export const skinGrowthSchema = z.object({
  form_id: z.string().uuid(),
  count: z.coerce.number().int().min(0, "العدد لازم يكون صفر أو أكبر"),
});
export type SkinGrowthFormValues = z.infer<typeof skinGrowthSchema>;

/**
 * حساب سعر تقديري لسطر ميزو بناءً على أقرب كمية معروفة (نص ملي / ملي كامل).
 * السعر النهائي قابل للتعديل يدويًا في الفورم قبل الحفظ.
 */
export function estimateMesoLinePrice(
  quantityMl: number,
  priceHalfMl: number | null | undefined,
  price1Ml: number | null | undefined
): number {
  if (quantityMl <= 0) return 0;

  if (quantityMl <= 0.5 && priceHalfMl != null) {
    // نسبة وتناسب من سعر نص الملي
    return Math.round(priceHalfMl * (quantityMl / 0.5) * 100) / 100;
  }

  if (price1Ml != null) {
    return Math.round(price1Ml * quantityMl * 100) / 100;
  }

  if (priceHalfMl != null) {
    return Math.round(priceHalfMl * (quantityMl / 0.5) * 100) / 100;
  }

  return 0;
}

/**
 * قاعدة زوائد جلدية: أول زايدة 500، وكل زيادة بعدها +200
 * (نفس منطق الـ trigger في قاعدة البيانات — للعرض الفوري في الواجهة فقط)
 */
export function estimateSkinGrowthPrice(count: number): number {
  if (count <= 0) return 0;
  return 500 + (count - 1) * 200;
}

/**
 * الديرمابن لازم يترافق دايمًا مع ميزو في نفس الفورم.
 * استخدم الدالة دي في submit handler بتاع فورم إضافة الجلسة/الاستمارة.
 */
export function validateDermapenRequiresMeso(
  serviceName: string | null | undefined,
  mesoLinesCount: number
): string | null {
  if (serviceName?.trim() === "ديرمابن" && mesoLinesCount === 0) {
    return "خدمة الديرمابن لازم تترافق مع جلسة ميزو — ضيف سطر ميزو واحد على الأقل";
  }
  return null;
}
