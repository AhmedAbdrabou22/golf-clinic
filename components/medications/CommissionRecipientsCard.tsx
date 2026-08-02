"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  medicationCommissionRecipientSchema,
  type MedicationCommissionRecipientFormValues,
} from "@/lib/validations/medications";
import {
  useMedicationCommissionRecipients,
  useCreateMedicationCommissionRecipient,
  useUpdateMedicationCommissionRecipient,
  useDeleteMedicationCommissionRecipient,
} from "@/hooks/useMedications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

function useStaffSimpleList() {
  return useQuery({
    queryKey: ["staff-simple-list"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("staff").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function CommissionRecipientsCard() {
  const { data: recipients, isLoading } = useMedicationCommissionRecipients();
  const { data: staffList } = useStaffSimpleList();
  const createRecipient = useCreateMedicationCommissionRecipient();
  const updateRecipient = useUpdateMedicationCommissionRecipient();
  const deleteRecipient = useDeleteMedicationCommissionRecipient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicationCommissionRecipientFormValues>({
    resolver: zodResolver(medicationCommissionRecipientSchema),
    defaultValues: { staff_id: "", amount_per_unit: 2.5 },
  });

  const onSubmit = async (values: MedicationCommissionRecipientFormValues) => {
    try {
      await createRecipient.mutateAsync(values);
      toast.success("تمت إضافة المستفيدة من عمولة الأدوية");
      reset({ staff_id: "", amount_per_unit: 2.5 });
    } catch {
      toast.error("حصل خطأ، حاول تاني (يمكن الموظفة مضافة قبل كده)");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">عمولة الأدوية (لكل علبة تتباع)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">الموظفة</label>
            <Controller
              control={control}
              name="staff_id"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختار الموظفة" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.staff_id && (
              <p className="text-xs text-red-500">{errors.staff_id.message}</p>
            )}
          </div>
          <div className="w-28 space-y-1">
            <label className="text-sm font-medium">المبلغ/علبة</label>
            <Input type="number" step="0.01" {...register("amount_per_unit")} />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            إضافة
          </Button>
        </form>

        <div className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">جاري التحميل...</p>}
          {recipients?.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span>{r.staff?.name ?? "—"}</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={r.amount_per_unit}
                  className="h-8 w-24"
                  onBlur={(e) => {
                    const value = Number(e.target.value);
                    if (!Number.isNaN(value) && value !== r.amount_per_unit) {
                      updateRecipient.mutate({ id: r.id, amount_per_unit: value });
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteRecipient.mutate(r.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
