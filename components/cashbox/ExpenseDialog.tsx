"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  expenseSchema,
  type ExpenseFormValues,
  EXPENSE_CATEGORY_LABELS,
} from "@/lib/validations/settings";
import { useCreateExpense } from "@/hooks/useCashbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpenseDialog({ open, onOpenChange }: ExpenseDialogProps) {
  const createExpense = useCreateExpense();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "other",
      expense_date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (values: ExpenseFormValues) => {
    try {
      await createExpense.mutateAsync(values);
      toast.success("تم تسجيل المصروف وتحديث الكاش");
      reset();
      onOpenChange(false);
    } catch {
      toast.error("حصل خطأ، حاول تاني");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>إضافة مصروف</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">النوع</label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">المبلغ (جنيه)</label>
              <Input type="number" step="0.01" {...register("amount")} />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">التاريخ</label>
              <Input type="date" {...register("expense_date")} />
              {errors.expense_date && (
                <p className="text-sm text-red-500">{errors.expense_date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">وصف</label>
            <Textarea {...register("description")} placeholder="تفاصيل المصروف" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              تسجيل المصروف
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
