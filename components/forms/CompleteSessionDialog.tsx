"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  completeSessionSchema,
  type CompleteSessionFormValues,
} from "@/lib/validations/patient";
import { useCompleteSessionWithPayment } from "@/hooks/usePatientForms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CompleteSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  formId: string;
  patientId: string;
  remainingBalance: number; // customer_price - sum of what's already been paid
}

export function CompleteSessionDialog({
  open,
  onOpenChange,
  sessionId,
  formId,
  patientId,
  remainingBalance,
}: CompleteSessionDialogProps) {
  const completeSession = useCompleteSessionWithPayment(formId, patientId);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompleteSessionFormValues>({
    resolver: zodResolver(completeSessionSchema),
    defaultValues: { amount_paid: 0, is_last_session: false },
  });

  const isLastSession = watch("is_last_session");

  const onSubmit = async (values: CompleteSessionFormValues) => {
    try {
      const result = await completeSession.mutateAsync({
        sessionId,
        input: {
          amountPaid: values.amount_paid,
          isLastSession: values.is_last_session,
          nextAppointmentDate: values.next_appointment_date,
        },
      });
      toast.success(`تم تسجيل دفعة ${result.amountCharged.toLocaleString()} ج.م`);
      reset();
      onOpenChange(false);
    } catch {
      toast.error("حصل خطأ أثناء إكمال الجلسة");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>إكمال الجلسة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Controller
              control={control}
              name="is_last_session"
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.checked);
                    if (e.target.checked) {
                      setValue("amount_paid", remainingBalance);
                    }
                  }}
                  className="h-4 w-4"
                />
              )}
            />
            دي آخر جلسة (هيتحصّل باقي المبلغ كامل تلقائيًا)
          </label>

          <div className="space-y-1">
            <label className="text-sm font-medium">المبلغ المدفوع دلوقتي (جنيه)</label>
            <Input
              type="number"
              step="0.01"
              disabled={isLastSession}
              {...register("amount_paid")}
            />
            {isLastSession && (
              <p className="text-xs text-muted-foreground">
                باقي المبلغ: {remainingBalance.toLocaleString()} ج.م — هيتحصّل كامل تلقائيًا
              </p>
            )}
            {errors.amount_paid && (
              <p className="text-sm text-red-500">{errors.amount_paid.message}</p>
            )}
          </div>

          {!isLastSession && (
            <div className="space-y-1">
              <label className="text-sm font-medium">معاد الجلسة الجاية</label>
              <Input type="date" {...register("next_appointment_date")} />
              {errors.next_appointment_date && (
                <p className="text-sm text-red-500">{errors.next_appointment_date.message}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              تأكيد
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}