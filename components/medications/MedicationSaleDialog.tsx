"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  medicationSaleSchema,
  type MedicationSaleFormValues,
} from "@/lib/validations/medications";
import { useMedicationsList, useCreateMedicationSale } from "@/hooks/useMedications";
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

interface MedicationSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MedicationSaleDialog({ open, onOpenChange }: MedicationSaleDialogProps) {
  const { data: medications } = useMedicationsList();
  const createSale = useCreateMedicationSale();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicationSaleFormValues>({
    resolver: zodResolver(medicationSaleSchema),
    defaultValues: {
      medication_id: "",
      quantity: 1,
      sale_date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (values: MedicationSaleFormValues) => {
    try {
      await createSale.mutateAsync(values);
      toast.success("تم تسجيل بيع الدواء وتحديث عمولة المسؤولات عنه");
      reset({ medication_id: "", quantity: 1, sale_date: new Date().toISOString().split("T")[0] });
      onOpenChange(false);
    } catch {
      toast.error("حصل خطأ، حاول تاني");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>تسجيل بيع دواء</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">الدواء</label>
            <Controller
              control={control}
              name="medication_id"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختار الدواء" />
                  </SelectTrigger>
                  <SelectContent>
                    {medications?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} — {m.selling_price.toLocaleString()} ج.م
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.medication_id && (
              <p className="text-sm text-red-500">{errors.medication_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">الكمية (عدد العلب)</label>
              <Input type="number" {...register("quantity")} />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">التاريخ</label>
              <Input type="date" {...register("sale_date")} />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            هيتسجل تلقائي 2.5 ج.م لمس شيماء و2.5 ج.م لمس أم هاجر عن كل علبة تتباع.
          </p>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              تسجيل البيع
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
