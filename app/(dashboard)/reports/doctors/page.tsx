"use client";

import { useMemo, useState } from "react";
import { DoctorReportFilters } from "@/components/reports/DoctorReportFilters";
import { DoctorReportSummaryTable } from "@/components/reports/DoctorReportSummaryTable";
import { DoctorReportDetail } from "@/components/reports/DoctorReportDetail";
import { useDoctorsReportSummary } from "@/hooks/useDoctorReports";
import { getReportRange, formatRangeLabel } from "@/lib/reports/date-ranges";
import type { ReportPeriodValue } from "@/lib/validations/doctorReports";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function DoctorsReportPage() {
  const [period, setPeriod] = useState<ReportPeriodValue>("daily");
  const [referenceDate, setReferenceDate] = useState(todayISO());
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const { from, to } = useMemo(
    () => getReportRange(period, referenceDate),
    [period, referenceDate]
  );
  const rangeLabel = useMemo(() => formatRangeLabel(period, from, to), [period, from, to]);

  const { data: rows, isLoading } = useDoctorsReportSummary(from, to);

  return (
    <div dir="rtl" className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">تقرير الأطباء</h1>

      <DoctorReportFilters
        period={period}
        referenceDate={referenceDate}
        onPeriodChange={(p) => {
          setPeriod(p);
          setSelectedDoctorId(null);
        }}
        onDateChange={(d) => {
          setReferenceDate(d);
          setSelectedDoctorId(null);
        }}
        rangeLabel={rangeLabel}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">جاري التحميل...</p>
      ) : (
        <DoctorReportSummaryTable
          rows={rows ?? []}
          selectedDoctorId={selectedDoctorId}
          onSelectDoctor={setSelectedDoctorId}
        />
      )}

      {selectedDoctorId && (
        <div className="rounded-lg border p-4">
          <DoctorReportDetail
            doctorId={selectedDoctorId}
            from={from}
            to={to}
            rangeLabel={rangeLabel}
          />
        </div>
      )}
    </div>
  );
}
