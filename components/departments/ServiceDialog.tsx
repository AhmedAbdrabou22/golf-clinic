"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, type ServiceFormValues } from "@/lib/validations/settings";
import { useCreateService, useUpdateService } from "@/hooks/useServicesAdmin";
import { useDepartments } from "@/hooks/useLookups";
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
import type { ServiceWithDepartment } from "@/services/services.service";
import { toast } from "sonner";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ServiceWithDepartment;
}

export function ServiceDialog({ open, onOpenChange, service }: ServiceDialogProps) {
  const isEdit = !!service;
  const { data: departments } = useDepartments();
  const createService = useCreateService();
  const updateService = useUpdateService();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name ?? "",
      department_id: service?.department_id ?? "",
      selling_price: service?.selling_price ?? 0,
      doctor_base_price: service?.doctor_base_price ?? 0,
    },
  });

  const onSubmit = async (values: ServiceFormValues) => {
    try {
      if (isEdit) {
        await updateService.mutateAsync({ id: service.id, values });
        toast.success("تم تعديل الخدمة");
      } else {
        await createService.mutateAsync(values);
        toast.success("تم إضافة الخدمة");
        reset();
      }
      onOpenChange(false);
    } catch {
      toast.error("حصل خطأ، حاول تاني");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل الخدمة" : "إضافة خدمة"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">اسم الخدمة</label>
            <Input {...register("name")} placeholder="مثال: كشف" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">القسم</label>
            <Controller
              control={control}
              name="department_id"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.department_id && (
              <p className="text-sm text-red-500">{errors.department_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">سعر العميل (جنيه)</label>
              <Input type="number" step="0.01" {...register("selling_price")} />
              {errors.selling_price && (
                <p className="text-sm text-red-500">{errors.selling_price.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">أساس عمولة الدكتور (جنيه)</label>
              <Input type="number" step="0.01" {...register("doctor_base_price")} />
              {errors.doctor_base_price && (
                <p className="text-sm text-red-500">{errors.doctor_base_price.message}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            عمولة الدكتور بتتحسب على السعر التاني (أساس العمولة)، مش سعر العميل.
          </p>

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
