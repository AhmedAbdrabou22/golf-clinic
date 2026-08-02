"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mesoProductSchema, type MesoProductFormValues } from "@/lib/validations/meso";
import { useCreateMesoProduct, useUpdateMesoProduct } from "@/hooks/useMesoProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { MesoProduct } from "@/services/mesoProducts";
import { toast } from "sonner";

interface MesoProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: MesoProduct;
}

export function MesoProductDialog({ open, onOpenChange, product }: MesoProductDialogProps) {
  const isEdit = !!product;
  const createProduct = useCreateMesoProduct();
  const updateProduct = useUpdateMesoProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MesoProductFormValues>({
    resolver: zodResolver(mesoProductSchema),
    defaultValues: {
      name: product?.name ?? "",
      company: product?.company ?? "",
      price_half_ml: product?.price_half_ml ?? undefined,
      price_1ml: product?.price_1ml ?? undefined,
    },
  });

  const onSubmit = async (values: MesoProductFormValues) => {
    try {
      if (isEdit) {
        await updateProduct.mutateAsync({ id: product.id, values });
        toast.success("تم تعديل المنتج");
      } else {
        await createProduct.mutateAsync(values);
        toast.success("تم إضافة المنتج");
        reset();
      }
      onOpenChange(false);
    } catch {
      toast.error("حصل خطأ، حاول تاني");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل منتج ميزو" : "إضافة منتج ميزو"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">اسم المنتج</label>
            <Input {...register("name")} placeholder="مثال: Neofound exo" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">الشركة (اختياري)</label>
            <Input {...register("company")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">سعر نص ملي</label>
              <Input type="number" step="0.01" {...register("price_half_ml")} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">سعر ملي كامل</label>
              <Input type="number" step="0.01" {...register("price_1ml")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isEdit ? "حفظ" : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
