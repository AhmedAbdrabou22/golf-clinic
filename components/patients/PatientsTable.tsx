"use client";

import { useState } from "react";
import Link from "next/link";
import { usePatients, useDeletePatient } from "@/hooks/usePatients";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PatientDialog } from "./PatientDialog";
import type { Patient } from "@/types/database.types";
import { toast } from "sonner";
import { Pencil, Trash2, FileText } from "lucide-react";

export function PatientsTable() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

  const { data: patients, isLoading } = usePatients(search);
  const deletePatient = useDeletePatient();

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingPatient(undefined);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePatient.mutateAsync(deleteTarget.id);
      toast.success("تم حذف المريض");
    } catch {
      toast.error("تعذر الحذف");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو رقم التليفون..."
          className="max-w-sm"
        />
        <Button onClick={handleAddNew}>إضافة مريض</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>السن</TableHead>
            <TableHead>التليفون</TableHead>
            <TableHead className="text-left">إجراءات</TableHead>
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
          {!isLoading && patients?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                لا يوجد مرضى
              </TableCell>
            </TableRow>
          )}
          {patients?.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>{patient.age ?? "-"}</TableCell>
              <TableCell>{patient.phone ?? "-"}</TableCell>
              <TableCell className="flex justify-start gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/patients/${patient.id}`}>
                    <FileText className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(patient)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(patient)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PatientDialog open={dialogOpen} onOpenChange={setDialogOpen} patient={editingPatient} />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المريض &quot;{deleteTarget?.name}&quot;؟ هذا الإجراء لا يمكن التراجع عنه.
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
