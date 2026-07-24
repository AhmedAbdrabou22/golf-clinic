"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema, type DepartmentFormValues } from "@/lib/validations/settings";
import { useCreateDepartment, useUpdateDepartment } from "@/hooks/useDepartmentsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Department } from "@/types/database.types";
import { toast } from "sonner";

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department;
}

export function DepartmentDialog({ open, onOpenChange, department }: DepartmentDialogProps) {
  const isEdit = !!department;
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: department?.name ?? "" },
  });

  const onSubmit = async (values: DepartmentFormValues) => {
    try {
      if (isEdit) {
        await updateDepartment.mutateAsync({ id: department.id, name: values.name });
        toast.success("تم تعديل القسم");
      } else {
        await createDepartment.mutateAsync(values.name);
        toast.success("تم إضافة القسم");
        reset();
      }
      onOpenChange(false);
    } catch {
      toast.error("حصل خطأ، حاول تاني");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل القسم" : "إضافة قسم"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">اسم القسم</label>
            <Input {...register("name")} placeholder="مثال: التغذية العلاجية" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
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
