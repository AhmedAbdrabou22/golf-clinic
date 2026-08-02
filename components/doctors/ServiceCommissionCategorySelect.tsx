"use client";

import { useCommissionCategories, useUpdateServiceCommissionCategory } from "@/hooks/useCommissionRates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ServiceCommissionCategorySelectProps {
  serviceId: string;
  currentCategoryId: string | null;
}

/**
 * Dropdown صغير يتحط جوه صف الخدمة في ServicesPanel عشان تحدد
 * تصنيف العمولة بتاعها (ليزر / جلسات بشرة وشعر / عام...).
 * ده اللي بيتحسب عليه عمولة الدكتور تلقائي.
 */
export function ServiceCommissionCategorySelect({
  serviceId,
  currentCategoryId,
}: ServiceCommissionCategorySelectProps) {
  const { data: categories } = useCommissionCategories();
  const updateCategory = useUpdateServiceCommissionCategory();

  return (
    <Select
      value={currentCategoryId ?? undefined}
      onValueChange={(value) => {
        updateCategory.mutate(
          { serviceId, commissionCategoryId: value },
          {
            onSuccess: () => toast.success("تم تحديث تصنيف العمولة"),
            onError: () => toast.error("حصل خطأ، حاول تاني"),
          }
        );
      }}
    >
      <SelectTrigger className="h-8 w-40">
        <SelectValue placeholder="تصنيف العمولة" />
      </SelectTrigger>
      <SelectContent>
        {categories?.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
