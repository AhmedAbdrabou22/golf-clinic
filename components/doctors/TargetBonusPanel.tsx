"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  doctorTargetBonusSchema,
  type DoctorTargetBonusFormValues,
} from "@/lib/validations/commission";
import {
  useDoctorTargetBonusRule,
  useUpsertDoctorTargetBonusRule,
  useDoctorCompletedSessionsThisMonth,
} from "@/hooks/useCommissionRates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TargetBonusPanelProps {
  doctorId: string;
}

export function TargetBonusPanel({ doctorId }: TargetBonusPanelProps) {
  const { data: rule, isLoading } = useDoctorTargetBonusRule(doctorId);
  const { data: completedSessions } = useDoctorCompletedSessionsThisMonth(doctorId);
  const upsertRule = useUpsertDoctorTargetBonusRule();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorTargetBonusFormValues>({
    resolver: zodResolver(doctorTargetBonusSchema),
    defaultValues: {
      doctor_id: doctorId,
      monthly_target_sessions: rule?.monthly_target_sessions ?? 1,
      bonus_hourly_rate: rule?.bonus_hourly_rate ?? undefined,
      bonus_commission_percentage: rule?.bonus_commission_percentage ?? 0,
      is_active: rule?.is_active ?? true,
    },
  });

  // إعادة تعبئة الفورم لما بيانات القاعدة الحالية توصل
  useEffect(() => {
    if (rule) {
      reset({
        doctor_id: doctorId,
        monthly_target_sessions: rule.monthly_target_sessions,
        bonus_hourly_rate: rule.bonus_hourly_rate ?? undefined,
        bonus_commission_percentage: rule.bonus_commission_percentage,
        is_active: rule.is_active,
      });
    }
  }, [rule, doctorId, reset]);

  const onSubmit = async (values: DoctorTargetBonusFormValues) => {
    try {
      await upsertRule.mutateAsync({ values: { ...values, doctor_id: doctorId }, existingId: rule?.id });
      toast.success("تم حفظ قاعدة التارجت الشهري");
    } catch {
      toast.error("حصل خطأ، حاول تاني");
    }
  };

  const target = rule?.monthly_target_sessions ?? 0;
  const completed = completedSessions ?? 0;
  const progressPct = target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0;
  const targetReached = target > 0 && completed >= target;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">بونص التارجت الشهري</CardTitle>
        {rule && (
          <Badge variant={targetReached ? "default" : "secondary"}>
            {targetReached ? "تم تحقيق التارجت" : "لسه ماوصلش"}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!isLoading && rule && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {completed} / {target} جلسة مكتملة الشهر ده
              </span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">عدد الجلسات المطلوب شهريًا (التارجت)</label>
            <Input type="number" {...register("monthly_target_sessions")} />
            {errors.monthly_target_sessions && (
              <p className="text-sm text-red-500">{errors.monthly_target_sessions.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">الأجر الجديد للساعة (اختياري)</label>
              <Input type="number" step="0.01" {...register("bonus_hourly_rate")} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">نسبة العمولة الجديدة %</label>
              <Input type="number" step="0.01" {...register("bonus_commission_percentage")} />
              {errors.bonus_commission_percentage && (
                <p className="text-sm text-red-500">
                  {errors.bonus_commission_percentage.message}
                </p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("is_active")} className="h-4 w-4" />
            القاعدة دي مفعّلة
          </label>

          <p className="text-xs text-muted-foreground">
            الأجر/النسبة الجديدة بتتطبق تلقائي بس من لحظة ما الدكتور يوصل لعدد الجلسات المطلوب
            لحد آخر الشهر، ومش بترجع بأثر رجعي على الجلسات اللي فاتت.
          </p>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            حفظ
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
