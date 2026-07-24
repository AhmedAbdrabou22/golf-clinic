// "use client";

// import { useState } from "react";
// import { useDoctorsList, useDeleteDoctor } from "@/hooks/useDoctorsAdmin";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { DoctorDialog } from "./DoctorDialog";
// import type { DoctorWithDepartment } from "@/services/doctors.service";
// import { Pencil, Trash2 } from "lucide-react";
// import { toast } from "sonner";

// export function DoctorsTable() {
//   const { data: doctors, isLoading } = useDoctorsList();
//   const deleteDoctor = useDeleteDoctor();
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editing, setEditing] = useState<DoctorWithDepartment | undefined>();
//   const [deleteTarget, setDeleteTarget] = useState<DoctorWithDepartment | null>(null);

//   const confirmDelete = async () => {
//     if (!deleteTarget) return;
//     try {
//       await deleteDoctor.mutateAsync(deleteTarget.id);
//       toast.success("تم حذف الدكتور");
//     } catch {
//       toast.error("تعذر الحذف — تأكد إن مفيش فورمات مرتبطة بالدكتور ده");
//     } finally {
//       setDeleteTarget(null);
//     }
//   };

//   return (
//     <div dir="rtl" className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h2 className="text-lg font-semibold">الأطباء</h2>
//         <Button
//           onClick={() => {
//             setEditing(undefined);
//             setDialogOpen(true);
//           }}
//         >
//           إضافة دكتور
//         </Button>
//       </div>

//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>الاسم</TableHead>
//             <TableHead>القسم</TableHead>
//             <TableHead>التليفون</TableHead>
//             <TableHead>نسبة العمولة</TableHead>
//             <TableHead>نوع التوظيف</TableHead>
//             <TableHead className="text-left">إجراءات</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {isLoading && (
//             <TableRow>
//               <TableCell colSpan={6} className="text-center text-muted-foreground">
//                 جاري التحميل...
//               </TableCell>
//             </TableRow>
//           )}
//           {doctors?.map((doctor) => (
//             <TableRow key={doctor.id}>
//               <TableCell className="font-medium">{doctor.name}</TableCell>
//               <TableCell>{doctor.department?.name}</TableCell>
//               <TableCell>{doctor.phone ?? "-"}</TableCell>
//               <TableCell>{doctor.commission_percentage}%</TableCell>
//               <TableCell>
//                 <Badge variant="secondary">
//                   {doctor.employment_type === "fixed_salary" ? "مرتب ثابت" : "بالساعة"}
//                 </Badge>
//               </TableCell>
//               <TableCell className="flex justify-start gap-2">
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => {
//                     setEditing(doctor);
//                     setDialogOpen(true);
//                   }}
//                 >
//                   <Pencil className="h-4 w-4" />
//                 </Button>
//                 <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(doctor)}>
//                   <Trash2 className="h-4 w-4 text-red-500" />
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>

//       <DoctorDialog open={dialogOpen} onOpenChange={setDialogOpen} doctor={editing} />

//       <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
//         <AlertDialogContent dir="rtl">
//           <AlertDialogHeader>
//             <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
//             <AlertDialogDescription>
//               هل أنت متأكد من حذف الدكتور &quot;{deleteTarget?.name}&quot;؟
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>إلغاء</AlertDialogCancel>
//             <AlertDialogAction onClick={confirmDelete}>حذف</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useDoctorsList, useDeleteDoctor } from "@/hooks/useDoctorsAdmin";
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
import { DoctorDialog } from "./DoctorDialog";
import { AttendanceDialog } from "./AttendanceDialog";
import type { DoctorWithDepartment } from "@/services/doctors.service";
import { Pencil, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

export function DoctorsTable() {
  const { data: doctors, isLoading } = useDoctorsList();
  const deleteDoctor = useDeleteDoctor();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DoctorWithDepartment | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<DoctorWithDepartment | null>(null);
  const [attendanceTarget, setAttendanceTarget] = useState<DoctorWithDepartment | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoctor.mutateAsync(deleteTarget.id);
      toast.success("تم حذف الدكتور");
    } catch {
      toast.error("تعذر الحذف — تأكد إن مفيش فورمات مرتبطة بالدكتور ده");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">الأطباء</h2>
        <Button
          onClick={() => {
            setEditing(undefined);
            setDialogOpen(true);
          }}
        >
          إضافة دكتور
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>القسم</TableHead>
            <TableHead>التليفون</TableHead>
            <TableHead>نسبة العمولة</TableHead>
            <TableHead>نوع التوظيف</TableHead>
            <TableHead className="text-left">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                جاري التحميل...
              </TableCell>
            </TableRow>
          )}
          {doctors?.map((doctor) => (
            <TableRow key={doctor.id}>
              <TableCell className="font-medium">{doctor.name}</TableCell>
              <TableCell>{doctor.department?.name}</TableCell>
              <TableCell>{doctor.phone ?? "-"}</TableCell>
              <TableCell>{doctor.commission_percentage}%</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {doctor.employment_type === "fixed_salary" ? "مرتب ثابت" : "بالساعة"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-start gap-2">
                {doctor.employment_type === "hourly" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="تسجيل حضور"
                    onClick={() => setAttendanceTarget(doctor)}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditing(doctor);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(doctor)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DoctorDialog open={dialogOpen} onOpenChange={setDialogOpen} doctor={editing} />

      {attendanceTarget && (
        <AttendanceDialog
          open={!!attendanceTarget}
          onOpenChange={(open) => !open && setAttendanceTarget(null)}
          doctorId={attendanceTarget.id}
          doctorName={attendanceTarget.name}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الدكتور &quot;{deleteTarget?.name}&quot;؟
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