"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  doctorCommissionRateSchema,
  type DoctorCommissionRateFormValues,
} from "@/lib/validations/commission";
import {
  useCommissionCategories,
  useCreateCommissionCategory,
  useCreateDoctorCommissionRate,
} from "@/hooks/useCommissionRates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CommissionRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
}

const NEW_CATEGORY_VALUE = "__new__";

export function CommissionRateDialog({ open, onOpenChange, doctorId }: CommissionRateDialogProps) {
  const { data: categories } = useCommissionCategories();
  const createCategory = useCreateCommissionCategory();
  const createRate = useCreateDoctorCommissionRate();
  const [newCategoryName, setNewCategoryName] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorCommissionRateFormValues>({
    resolver: zodResolver(doctorCommissionRateSchema),
    defaultValues: {
      doctor_id: doctorId,
      commission_category_id: "",
      percentage: 0,
      effective_from: new Date().toISOString().split("T")[0],
    },
  });

  const selectedCategory = watch("commission_category_id");

  const onSubmit = async (values: DoctorCommissionRateFormValues) => {
    try {
      let categoryId = values.commission_category_id;

      if (categoryId === NEW_CATEGORY_VALUE) {
        if (!newCategoryName.trim()) {
          toast.error("اكتب اسم التصنيف الجديد");
          return;
        }
        const created = await createCategory.mutateAsync(newCategoryName.trim());
        categoryId = created.id;
      }

      await createRate.mutateAsync({ ...values, doctor_id: doctorId, commission_category_id: categoryId });
      toast.success("تمت إضافة نسبة العمولة");
      reset({
        doctor_id: doctorId,
        commission_category_id: "",
        percentage: 0,
        effective_from: new Date().toISOString().split("T")[0],
      });
      setNewCategoryName("");
      onOpenChange(false);
    } catch {
      toast.error("حصل خطأ، حاول تاني");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>إضافة نسبة عمولة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">تصنيف الخدمة</label>
            <Controller
              control={control}
              name="commission_category_id"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختار التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                    <SelectItem value={NEW_CATEGORY_VALUE}>+ تصنيف جديد</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.commission_category_id && (
              <p className="text-sm text-red-500">{errors.commission_category_id.message}</p>
            )}
          </div>

          {selectedCategory === NEW_CATEGORY_VALUE && (
            <div className="space-y-1">
              <label className="text-sm font-medium">اسم التصنيف الجديد</label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="مثال: ليزر"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">النسبة %</label>
              <Input type="number" step="0.01" {...register("percentage")} />
              {errors.percentage && (
                <p className="text-sm text-red-500">{errors.percentage.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">تسري من</label>
              <Input type="date" {...register("effective_from")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              إضافة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
