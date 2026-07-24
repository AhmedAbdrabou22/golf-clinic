"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorSchema, type DoctorFormValues } from "@/lib/validations/settings";
import { useCreateDoctor, useUpdateDoctor } from "@/hooks/useDoctorsAdmin";
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
import type { DoctorWithDepartment } from "@/services/doctors.service";
import { toast } from "sonner";

interface DoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: DoctorWithDepartment;
}

export function DoctorDialog({ open, onOpenChange, doctor }: DoctorDialogProps) {
  const isEdit = !!doctor;
  const { data: departments } = useDepartments();
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: doctor?.name ?? "",
      department_id: doctor?.department_id ?? "",
      phone: doctor?.phone ?? "",
      commission_percentage: doctor?.commission_percentage ?? 0,
      employment_type: doctor?.employment_type ?? "fixed_salary",
    },
  });

  const employmentType = watch("employment_type");

  const onSubmit = async (values: DoctorFormValues) => {
    try {
      if (isEdit) {
        await updateDoctor.mutateAsync({ id: doctor.id, values });
        toast.success("تم تعديل بيانات الدكتور");
      } else {
        await createDoctor.mutateAsync(values);
        toast.success("تم إضافة الدكتور");
        reset();
      }
      onOpenChange(false);
    } catch {
      toast.error("حصل خطأ، حاول تاني");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل بيانات الدكتور" : "إضافة دكتور"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">الاسم</label>
            <Input {...register("name")} placeholder="د. ..." />
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
              <label className="text-sm font-medium">التليفون</label>
              <Input {...register("phone")} placeholder="01xxxxxxxxx" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">نسبة العمولة %</label>
              <Input type="number" step="0.01" {...register("commission_percentage")} />
              {errors.commission_percentage && (
                <p className="text-sm text-red-500">{errors.commission_percentage.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">نوع التوظيف</label>
            <Controller
              control={control}
              name="employment_type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed_salary">مرتب ثابت</SelectItem>
                    <SelectItem value="hourly">بالساعة</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {employmentType === "fixed_salary" ? (
            <div className="space-y-1">
              <label className="text-sm font-medium">المرتب الشهري (جنيه)</label>
              <Input type="number" step="0.01" {...register("monthly_salary")} />
              {errors.monthly_salary && (
                <p className="text-sm text-red-500">{errors.monthly_salary.message}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">سعر الساعة (جنيه)</label>
                <Input type="number" step="0.01" {...register("hourly_rate")} />
                {errors.hourly_rate && (
                  <p className="text-sm text-red-500">{errors.hourly_rate.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">عدد الساعات</label>
                <Input type="number" step="0.5" {...register("working_hours")} />
              </div>
            </div>
          )}

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
