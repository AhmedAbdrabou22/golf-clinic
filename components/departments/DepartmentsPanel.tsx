"use client";

import { useState } from "react";
import { useDepartmentsList, useDeleteDepartment } from "@/hooks/useDepartmentsAdmin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { DepartmentDialog } from "./DepartmentDialog";
import type { Department } from "@/types/database.types";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DepartmentsPanel() {
  const { data: departments, isLoading } = useDepartmentsList();
  const deleteDepartment = useDeleteDepartment();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDepartment.mutateAsync(deleteTarget.id);
      toast.success("تم حذف القسم");
    } catch {
      toast.error("تعذر الحذف — تأكد إن مفيش خدمات أو أطباء مرتبطين بالقسم ده");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>الأقسام</CardTitle>
        <Button
          size="sm"
          onClick={() => {
            setEditing(undefined);
            setDialogOpen(true);
          }}
        >
          إضافة قسم
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            )}
            {departments?.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">{dept.name}</TableCell>
                <TableCell className="flex justify-start gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(dept);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(dept)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <DepartmentDialog open={dialogOpen} onOpenChange={setDialogOpen} department={editing} />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف قسم &quot;{deleteTarget?.name}&quot;؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
