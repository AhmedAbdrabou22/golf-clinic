"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  staffSchema,
  STAFF_ROLE_LABELS,
  STAFF_ROLES,
  type StaffFormValues,
} from "@/lib/validations/staff";
import { useCreateStaff, useUpdateStaff } from "@/hooks/useStaff";
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
import type { Staff } from "@/services/staff";
import { toast } from "sonner";

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: Staff;
}

export function StaffDialog({ open, onOpenChange, staff }: StaffDialogProps) {
  const isEdit = !!staff;
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: staff?.name ?? "",
      role: staff?.role ?? "reception",
      monthly_salary: staff?.monthly_salary ?? undefined,
      phone: staff?.phone ?? "",
    },
  });

  const onSubmit = async (values: StaffFormValues) => {
    try {
      if (isEdit) {
        await updateStaff.mutateAsync({ id: staff.id, values });
        toast.success("تم تعديل بيانات الموظف");
      } else {
        await createStaff.mutateAsync(values);
        toast.success("تم إضافة الموظف");
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
          <DialogTitle>{isEdit ? "تعديل بيانات موظف" : "إضافة موظف"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">الاسم</label>
            <Input {...register("name")} placeholder="مثال: مس شيماء" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">الدور</label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {STAFF_ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">المرتب الشهري (اختياري)</label>
              <Input type="number" step="0.01" {...register("monthly_salary")} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">التليفون (اختياري)</label>
              <Input {...register("phone")} />
            </div>
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
