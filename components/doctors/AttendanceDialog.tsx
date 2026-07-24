"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { attendanceSchema, type AttendanceFormValues } from "@/lib/validations/settings";
import { useDoctorAttendance, useLogAttendance } from "@/hooks/useDoctorAttendance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
  doctorName: string;
}

export function AttendanceDialog({
  open,
  onOpenChange,
  doctorId,
  doctorName,
}: AttendanceDialogProps) {
  const { data: logs, isLoading } = useDoctorAttendance(doctorId);
  const logAttendance = useLogAttendance(doctorId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: { work_date: new Date().toISOString().split("T")[0] },
  });

  const onSubmit = async (values: AttendanceFormValues) => {
    try {
      await logAttendance.mutateAsync(values);
      toast.success("تم تسجيل الحضور");
      reset({ work_date: values.work_date, hours_worked: undefined });
    } catch {
      toast.error("تعذر تسجيل الحضور (يوم مسجل قبل كده؟)");
    }
  };

  const totalAmount = (logs ?? []).reduce((sum, log) => sum + Number(log.amount), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تسجيل حضور — {doctorName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">التاريخ</label>
            <Input type="date" {...register("work_date")} />
            {errors.work_date && (
              <p className="text-sm text-red-500">{errors.work_date.message}</p>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">عدد الساعات</label>
            <Input type="number" step="0.5" placeholder="مثال: 6" {...register("hours_worked")} />
            {errors.hours_worked && (
              <p className="text-sm text-red-500">{errors.hours_worked.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            تسجيل
          </Button>
        </form>

        <div className="pt-2">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span>إجمالي المستحق</span>
            <span>{totalAmount.toLocaleString()} ج.م</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الساعات</TableHead>
                <TableHead>سعر الساعة</TableHead>
                <TableHead>المبلغ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              )}
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.work_date}</TableCell>
                  <TableCell>{log.hours_worked}</TableCell>
                  <TableCell>{log.hourly_rate_snapshot} ج.م</TableCell>
                  <TableCell>{log.amount.toLocaleString()} ج.م</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}