"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  staffSessionCommissionRuleSchema,
  type StaffSessionCommissionRuleFormValues,
} from "@/lib/validations/staff";
import {
  useStaffCommissionRules,
  useCreateStaffCommissionRule,
  useDeleteStaffCommissionRule,
} from "@/hooks/useStaff";
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
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Staff } from "@/services/staff";

interface StaffCommissionRulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff | null;
}

// قائمة بسيطة بالخدمات لاختيار الخدمة اللي هيتحدد عليها عمولة الموظف (زي: تنظيف البشرة)
function useServicesSimpleList() {
  return useQuery({
    queryKey: ["services-simple-list"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("services")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function StaffCommissionRulesDialog({
  open,
  onOpenChange,
  staff,
}: StaffCommissionRulesDialogProps) {
  const { data: rules, isLoading } = useStaffCommissionRules(staff?.id ?? null);
  const { data: services } = useServicesSimpleList();
  const createRule = useCreateStaffCommissionRule();
  const deleteRule = useDeleteStaffCommissionRule(staff?.id ?? "");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffSessionCommissionRuleFormValues>({
    resolver: zodResolver(staffSessionCommissionRuleSchema),
    defaultValues: { staff_id: staff?.id ?? "", service_id: "", amount_per_session: 0 },
  });

  if (!staff) return null;

  const onSubmit = async (values: StaffSessionCommissionRuleFormValues) => {
    try {
      await createRule.mutateAsync({ ...values, staff_id: staff.id });
      toast.success("تمت إضافة قاعدة العمولة");
      reset({ staff_id: staff.id, service_id: "", amount_per_session: 0 });
    } catch {
      toast.error("حصل خطأ، حاول تاني");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>عمولة الجلسات — {staff.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">الخدمة</label>
              <Controller
                control={control}
                name="service_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختار خدمة" />
                    </SelectTrigger>
                    <SelectContent>
                      {services?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.service_id && (
                <p className="text-xs text-red-500">{errors.service_id.message}</p>
              )}
            </div>
            <div className="w-28 space-y-1">
              <label className="text-sm font-medium">المبلغ/جلسة</label>
              <Input type="number" step="0.01" {...register("amount_per_session")} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              إضافة
            </Button>
          </form>

          <div className="space-y-2">
            {isLoading && <p className="text-sm text-muted-foreground">جاري التحميل...</p>}
            {rules?.length === 0 && (
              <p className="text-sm text-muted-foreground">مفيش قواعد عمولة مضافة</p>
            )}
            {rules?.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span>{rule.service?.name ?? "—"}</span>
                <span className="font-medium">{rule.amount_per_session.toLocaleString()} ج.م / جلسة</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteRule.mutate(rule.id)}
                  disabled={deleteRule.isPending}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
