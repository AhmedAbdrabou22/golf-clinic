"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { DoctorReportSummaryRow } from "@/services/doctorReports.service";

interface Props {
  rows: DoctorReportSummaryRow[];
  selectedDoctorId: string | null;
  onSelectDoctor: (doctorId: string) => void;
}

const EMPLOYMENT_LABELS = {
  fixed_salary: "راتب ثابت",
  hourly: "بالساعة",
};

export function DoctorReportSummaryTable({ rows, selectedDoctorId, onSelectDoctor }: Props) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">لا يوجد أطباء مسجلين.</p>;
  }

  return (
    <div dir="rtl" className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الدكتور</TableHead>
            <TableHead>القسم</TableHead>
            <TableHead>نوع التوظيف</TableHead>
            <TableHead>عدد الجلسات المنجزة</TableHead>
            <TableHead>العمولة المكتسبة</TableHead>
            <TableHead>مستحقات الساعات</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.doctorId}
              className={row.doctorId === selectedDoctorId ? "bg-muted/50" : undefined}
            >
              <TableCell className="font-medium">{row.doctorName}</TableCell>
              <TableCell>{row.departmentName ?? "—"}</TableCell>
              <TableCell>{EMPLOYMENT_LABELS[row.employmentType]}</TableCell>
              <TableCell>{row.completedSessionsCount}</TableCell>
              <TableCell>{row.commissionTotal.toFixed(2)} ج.م</TableCell>
              <TableCell>
                {row.employmentType === "hourly"
                  ? `${row.attendanceAmountTotal.toFixed(2)} ج.م`
                  : "—"}
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => onSelectDoctor(row.doctorId)}>
                  عرض التفاصيل
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
