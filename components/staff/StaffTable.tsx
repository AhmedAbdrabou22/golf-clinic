"use client";

import { useState } from "react";
import { useStaffList, useDeleteStaff } from "@/hooks/useStaff";
import { STAFF_ROLE_LABELS } from "@/lib/validations/staff";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Percent, Plus } from "lucide-react";
import { StaffDialog } from "./StaffDialog";
import { StaffCommissionRulesDialog } from "./StaffCommissionRulesDialog";
import type { Staff } from "@/services/staff";
import { toast } from "sonner";

export function StaffTable() {
  const { data: staffList, isLoading } = useStaffList();
  const deleteStaff = useDeleteStaff();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);
  const [commissionStaff, setCommissionStaff] = useState<Staff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);

  const openAddDialog = () => {
    setEditingStaff(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (staff: Staff) => {
    setEditingStaff(staff);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStaff.mutateAsync(deleteTarget.id);
      toast.success("تم حذف الموظف");
    } catch {
      toast.error("حصل خطأ، حاول تاني");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">رواتب العمال</h2>
        <Button onClick={openAddDialog}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة موظف
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>الدور</TableHead>
            <TableHead>المرتب الشهري</TableHead>
            <TableHead>التليفون</TableHead>
            <TableHead className="text-left">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                جاري التحميل...
              </TableCell>
            </TableRow>
          )}
          {staffList?.map((staff) => (
            <TableRow key={staff.id}>
              <TableCell className="font-medium">{staff.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{STAFF_ROLE_LABELS[staff.role]}</Badge>
              </TableCell>
              <TableCell>
                {staff.monthly_salary != null
                  ? `${staff.monthly_salary.toLocaleString()} ج.م`
                  : "—"}
              </TableCell>
              <TableCell>{staff.phone ?? "—"}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  title="عمولة الجلسات"
                  onClick={() => setCommissionStaff(staff)}
                >
                  <Percent className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(staff)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(staff)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <StaffDialog open={dialogOpen} onOpenChange={setDialogOpen} staff={editingStaff} />
      <StaffCommissionRulesDialog
        open={!!commissionStaff}
        onOpenChange={(open) => !open && setCommissionStaff(null)}
        staff={commissionStaff}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              متأكد إنك عايز تحذف {deleteTarget?.name}؟ الإجراء ده مش هيرجع تاني.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
