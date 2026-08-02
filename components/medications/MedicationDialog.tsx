"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { medicationSchema, type MedicationFormValues } from "@/lib/validations/medications";
import { useCreateMedication, useUpdateMedication } from "@/hooks/useMedications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Medication } from "@/services/medications";
import { toast } from "sonner";

interface MedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication?: Medication;
}

export function MedicationDialog({ open, onOpenChange, medication }: MedicationDialogProps) {
  const isEdit = !!medication;
  const createMedication = useCreateMedication();
  const updateMedication = useUpdateMedication();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: medication?.name ?? "",
      selling_price: medication?.selling_price ?? 0,
    },
  });

  const onSubmit = async (values: MedicationFormValues) => {
    try {
      if (isEdit) {
        await updateMedication.mutateAsync({ id: medication.id, values });
        toast.success("تم تعديل الدواء");
      } else {
        await createMedication.mutateAsync(values);
        toast.success("تم إضافة الدواء");
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
          <DialogTitle>{isEdit ? "تعديل دواء" : "إضافة دواء"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">اسم الدواء</label>
            <Input {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">سعر البيع (جنيه)</label>
            <Input type="number" step="0.01" {...register("selling_price")} />
            {errors.selling_price && (
              <p className="text-sm text-red-500">{errors.selling_price.message}</p>
            )}
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
