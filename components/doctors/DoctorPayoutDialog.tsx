"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import {
//   doctorPayoutSchema,
//   type DoctorPayoutFormValues,
// } from "@/lib/validations/doctor-payout";

import {
  useDisburseDoctorPayout,
  useDoctorPendingDues,
} from "@/hooks/useDoctorPayouts";
import { DoctorPayoutFormValues, doctorPayoutSchema } from "@/lib/validations/doctor-payout";

interface DoctorPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
}

export function DoctorPayoutDialog({
  open,
  onOpenChange,
  doctorId,
}: DoctorPayoutDialogProps) {
  const { data, isLoading } = useDoctorPendingDues(doctorId, open);

  const payout = useDisburseDoctorPayout();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DoctorPayoutFormValues>({
    resolver: zodResolver(doctorPayoutSchema),
    defaultValues: {
      salaryAmount: 0,
      commissionAmount: 0,
      deductions: 0,
      bonuses: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (!data) return;

    reset({
      salaryAmount: data.salaryAmount,
      commissionAmount: data.commissionAmount,
      deductions: 0,
      bonuses: 0,
      notes: "",
    });
  }, [data, reset]);

  const salary = Number(watch("salaryAmount") || 0);
  const commission = Number(watch("commissionAmount") || 0);
  const deductions = Number(watch("deductions") || 0);
  const bonuses = Number(watch("bonuses") || 0);

  const total = useMemo(() => {
    return salary + commission - deductions + bonuses;
  }, [salary, commission, deductions, bonuses]);
    const onSubmit = async (values: DoctorPayoutFormValues) => {
    try {
      await payout.mutateAsync({
        doctorId,
        salaryAmount: values.salaryAmount,
        commissionAmount: values.commissionAmount,
        deductions: values.deductions,
        bonuses: values.bonuses,
        notes: values.notes,
      });

      toast.success("تم صرف مستحقات الدكتور بنجاح");

      reset();

      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء صرف المستحقات"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }

        onOpenChange(value);
      }}
    >
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>صرف مستحقات الطبيب</DialogTitle>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            جار تحميل البيانات...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="rounded-lg border p-4 space-y-2">
              <p className="font-semibold">{data.doctorName}</p>

              <p className="text-sm text-muted-foreground">
                {data.employmentType === "fixed_salary"
                  ? "طبيب براتب ثابت"
                  : "طبيب بالساعة"}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                {data.employmentType === "hourly"
                  ? "مستحقات الساعات"
                  : "الراتب"}
              </label>

              <Input
                type="number"
                step="0.01"
                {...register("salaryAmount", {
                  valueAsNumber: true,
                })}
              />

              {errors.salaryAmount && (
                <p className="text-sm text-destructive">
                  {errors.salaryAmount.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                العمولات
              </label>

              <Input
                type="number"
                step="0.01"
                {...register("commissionAmount", {
                  valueAsNumber: true,
                })}
              />

              {errors.commissionAmount && (
                <p className="text-sm text-destructive">
                  {errors.commissionAmount.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  الخصومات
                </label>

                <Input
                  type="number"
                  step="0.01"
                  {...register("deductions", {
                    valueAsNumber: true,
                  })}
                />

                {errors.deductions && (
                  <p className="text-sm text-destructive">
                    {errors.deductions.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  المكافآت
                </label>

                <Input
                  type="number"
                  step="0.01"
                  {...register("bonuses", {
                    valueAsNumber: true,
                  })}
                />

                {errors.bonuses && (
                  <p className="text-sm text-destructive">
                    {errors.bonuses.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                ملاحظات
              </label>

              <Input
                {...register("notes")}
                placeholder="اختياري"
              />

              {errors.notes && (
                <p className="text-sm text-destructive">
                  {errors.notes.message}
                </p>
              )}
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  إجمالي الصرف
                </span>

                <span className="text-xl font-bold">
                  {total.toFixed(2)} ج.م
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isSubmitting ||
                  payout.isPending ||
                  total <= 0
                }
              >
                {payout.isPending
                  ? "جار تنفيذ الصرف..."
                  : "صرف المستحقات"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}