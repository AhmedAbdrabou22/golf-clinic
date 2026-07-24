"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorReportDetail } from "@/hooks/useDoctorReports";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DoctorPayoutDialog } from "@/components/doctors/DoctorPayoutDialog";
interface Props {
  doctorId: string;
  from: string;
  to: string;
  rangeLabel: string;
}

export function DoctorReportDetail({ doctorId, from, to, rangeLabel }: Props) {
  const { data, isLoading, error } = useDoctorReportDetail(doctorId, from, to);
  const [payoutOpen, setPayoutOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-sm text-destructive">حدث خطأ أثناء تحميل تقرير الدكتور.</p>;
  }

  const { doctor, sessions, commissions, attendance, currentMonthlySalary, totals } = data;

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {doctor.name}
          </h3>

          <p className="text-sm text-muted-foreground">
            {doctor.department_name ?? "—"} · {rangeLabel}
          </p>
        </div>

        <Button
          onClick={() => setPayoutOpen(true)}
        >
          صرف المستحقات
        </Button>
      </div>

      {/* بطاقات الملخص */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">الجلسات المنجزة</p>
          <p className="text-xl font-bold">{totals.sessionsCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">العمولة المكتسبة</p>
          <p className="text-xl font-bold">{totals.commissionTotal.toFixed(2)} ج.م</p>
        </Card>
        {doctor.employment_type === "hourly" ? (
          <>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">إجمالي الساعات</p>
              <p className="text-xl font-bold">{totals.attendanceHoursTotal}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">مستحقات الساعات</p>
              <p className="text-xl font-bold">{totals.attendanceAmountTotal.toFixed(2)} ج.م</p>
            </Card>
          </>
        ) : (
          <Card className="p-4 sm:col-span-2">
            <p className="text-xs text-muted-foreground">الراتب الشهري الحالي (مرجعي)</p>
            <p className="text-xl font-bold">
              {currentMonthlySalary != null ? `${currentMonthlySalary.toFixed(2)} ج.م` : "—"}
            </p>
          </Card>
        )}
      </div>

      {/* سجل الحضور - بالساعة فقط */}
      {doctor.employment_type === "hourly" && (
        <section>
          <h4 className="mb-2 font-medium">سجل الحضور</h4>
          {attendance.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا يوجد تسجيل حضور في هذه الفترة.</p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>عدد الساعات</TableHead>
                    <TableHead>سعر الساعة</TableHead>
                    <TableHead>المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.work_date}</TableCell>
                      <TableCell>{a.hours_worked}</TableCell>
                      <TableCell>{a.hourly_rate_snapshot.toFixed(2)} ج.م</TableCell>
                      <TableCell>{a.amount.toFixed(2)} ج.م</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      )}

      {/* الجلسات المنجزة */}
      <section>
        <h4 className="mb-2 font-medium">الجلسات المنجزة</h4>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا يوجد جلسات منجزة في هذه الفترة.</p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المريض</TableHead>
                  <TableHead>الخدمة</TableHead>
                  <TableHead>رقم الاستمارة</TableHead>
                  <TableHead>المبلغ المحصّل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.session_id}>
                    <TableCell>{s.session_date}</TableCell>
                    <TableCell>{s.patient_name}</TableCell>
                    <TableCell>{s.service_name}</TableCell>
                    <TableCell>{s.form_number}</TableCell>
                    <TableCell>{s.amount_paid.toFixed(2)} ج.م</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* العمولات المكتسبة */}
      <section>
        <h4 className="mb-2 font-medium">العمولات المكتسبة (استمارات اكتملت في هذه الفترة)</h4>
        {commissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا يوجد عمولات مكتسبة في هذه الفترة.</p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المريض</TableHead>
                  <TableHead>رقم الاستمارة</TableHead>
                  <TableHead>سعر المريض</TableHead>
                  <TableHead>السعر الأساسي للدكتور</TableHead>
                  <TableHead>العمولة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{new Date(c.created_at).toLocaleDateString("ar-EG")}</TableCell>
                    <TableCell>{c.patient_name}</TableCell>
                    <TableCell>{c.form_number}</TableCell>
                    <TableCell>{c.customer_price.toFixed(2)} ج.م</TableCell>
                    <TableCell>{c.doctor_base_price.toFixed(2)} ج.م</TableCell>
                    <TableCell className="font-medium">
                      {c.commission_amount.toFixed(2)} ج.م
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
      <DoctorPayoutDialog
  open={payoutOpen}
  onOpenChange={setPayoutOpen}
  doctorId={doctor.id}
/>
    </div>
  );
}
