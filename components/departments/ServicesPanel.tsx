"use client";

import { useState } from "react";
import { useServicesList, useDeleteService } from "@/hooks/useServicesAdmin";
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
import { ServiceDialog } from "./ServiceDialog";
import type { ServiceWithDepartment } from "@/services/services.service";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ServicesPanel() {
  const { data: services, isLoading } = useServicesList();
  const deleteService = useDeleteService();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceWithDepartment | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<ServiceWithDepartment | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteService.mutateAsync(deleteTarget.id);
      toast.success("تم حذف الخدمة");
    } catch {
      toast.error("تعذر الحذف");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>الخدمات</CardTitle>
        <Button
          size="sm"
          onClick={() => {
            setEditing(undefined);
            setDialogOpen(true);
          }}
        >
          إضافة خدمة
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>سعر العميل</TableHead>
              <TableHead>أساس العمولة</TableHead>
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
            {services?.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.department?.name}</TableCell>
                <TableCell>{service.selling_price} ج.م</TableCell>
                <TableCell>{service.doctor_base_price} ج.م</TableCell>
                <TableCell className="flex justify-start gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(service);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(service)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <ServiceDialog open={dialogOpen} onOpenChange={setDialogOpen} service={editing} />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف خدمة &quot;{deleteTarget?.name}&quot;؟
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
