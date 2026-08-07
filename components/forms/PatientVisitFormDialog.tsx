

"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  patientVisitFormSchema,
  type PatientVisitFormValues,
} from "@/lib/validations/patient";
import { useCreatePatientForm } from "@/hooks/usePatientForms";
import { useDepartments, useDoctors, useServices } from "@/hooks/useLookups";
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

interface PatientVisitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
}

export function PatientVisitFormDialog({
  open,
  onOpenChange,
  patientId,
}: PatientVisitFormDialogProps) {
  const [departmentId, setDepartmentId] = useState<string>("");
  const { data: departments } = useDepartments();
  const { data: doctors } = useDoctors(departmentId);
  const { data: services } = useServices(departmentId);
  const createForm = useCreatePatientForm(patientId);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientVisitFormValues>({
    resolver: zodResolver(patientVisitFormSchema),
    defaultValues: {
      sessions_count: 1,
      completed_sessions: 0,
      payment_status: "pending",
    },
  });

  const selectedServiceId = watch("service_id");

  // Reset everything when the dialog closes — prevents stale visual state on reopen
  useEffect(() => {
    if (!open) {
      reset();
      setDepartmentId("");
    }
  }, [open, reset]);

  // Auto-fill pricing when a service is picked — admin can still edit both fields after
  useEffect(() => {
    const service = services?.find((s) => s.id === selectedServiceId);
    if (service) {
      setValue("customer_price", service.selling_price);
      setValue("doctor_base_price", service.doctor_base_price);
    }
  }, [selectedServiceId, services, setValue]);

  const onSubmit = async (values: PatientVisitFormValues) => {
    try {
      await createForm.mutateAsync(values);
      toast.success("تم إنشاء الفورم بنجاح");
      reset();
      setDepartmentId("");
      onOpenChange(false);
    } catch (error) {
      console.error("Create patient form failed:", error);
      toast.error("حصل خطأ أثناء إنشاء الفورم — افتح الـ Console (F12) للتفاصيل");
    }
  };

  const onInvalid = (formErrors: typeof errors) => {
    console.error("Validation errors:", formErrors);
    const fieldNames: Record<string, string> = {
      department_id: "القسم",
      doctor_id: "الدكتور",
      service_id: "الخدمة",
      sessions_count: "عدد الجلسات",
      completed_sessions: "الجلسات المنجزة",
      customer_price: "سعر العميل",
      doctor_base_price: "أساس عمولة الدكتور",
    };
    const failedFields = Object.keys(formErrors)
      .map((key) => fieldNames[key] ?? key)
      .join("، ");
    toast.error(`الحقول دي فيها مشكلة: ${failedFields || "غير معروف — شوف الـ Console"}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>فورم زيارة جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">القسم</label>
            <Select
              value={departmentId}
              onValueChange={(val) => {
                setDepartmentId(val);
                setValue("department_id", val, { shouldValidate: true });
                setValue("doctor_id", "");
                setValue("service_id", "");
              }}
            >
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
            {errors.department_id && (
              <p className="text-sm text-red-500">{errors.department_id.message}</p>
            )}
          </div>
          

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">الدكتور</label>
              <Controller
                control={control}
                name="doctor_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={!departmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدكتور" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors?.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.doctor_id && (
                <p className="text-sm text-red-500">{errors.doctor_id.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">الخدمة</label>
              <Controller
                control={control}
                name="service_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={!departmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الخدمة" />
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
                <p className="text-sm text-red-500">{errors.service_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">سعر العميل (جنيه)</label>
              <Input type="number" step="0.01" {...register("customer_price")} />
              {errors.customer_price && (
                <p className="text-sm text-red-500">{errors.customer_price.message}</p>
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

          <div className="space-y-1">
            <label className="text-sm font-medium">عدد الجلسات</label>
            <Input type="number" {...register("sessions_count")} />
            {errors.sessions_count && (
              <p className="text-sm text-red-500">{errors.sessions_count.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">التشخيص</label>
            <Textarea {...register("diagnosis")} placeholder="التشخيص" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">ملاحظات</label>
            <Textarea {...register("notes")} placeholder="ملاحظات إضافية" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              إنشاء الفورم
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}