"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, type PatientFormValues } from "@/lib/validations/patient";
import { useCreatePatient, useUpdatePatient } from "@/hooks/usePatients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Patient } from "@/types/database.types";
import { toast } from "sonner";

interface PatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient; // present = edit mode, absent = create mode
}

export function PatientDialog({ open, onOpenChange, patient }: PatientDialogProps) {
  const isEdit = !!patient;
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient(patient?.id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: patient?.name ?? "",
      age: patient?.age ?? undefined,
      phone: patient?.phone ?? "",
      notes: patient?.notes ?? "",
    },
  });

  const onSubmit = async (values: PatientFormValues) => {
    try {
      if (isEdit) {
        await updatePatient.mutateAsync(values);
        toast.success("تم تعديل بيانات المريض");
      } else {
        await createPatient.mutateAsync(values);
        toast.success("تم إضافة المريض");
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
          <DialogTitle>{isEdit ? "تعديل بيانات المريض" : "إضافة مريض جديد"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">الاسم</label>
            <Input {...register("name")} placeholder="اسم المريض" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">السن</label>
              <Input type="number" {...register("age")} placeholder="السن" />
              {errors.age && <p className="text-sm text-red-500">{errors.age.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">التليفون</label>
              <Input {...register("phone")} placeholder="01xxxxxxxxx" />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">ملاحظات</label>
            <Textarea {...register("notes")} placeholder="ملاحظات إضافية" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isEdit ? "حفظ التعديلات" : "إضافة المريض"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
