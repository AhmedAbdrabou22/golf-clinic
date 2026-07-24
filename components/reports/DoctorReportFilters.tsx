"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ReportPeriodValue } from "@/lib/validations/doctorReports";

const PERIOD_LABELS: Record<ReportPeriodValue, string> = {
  daily: "يومي",
  weekly: "أسبوعي",
  monthly: "شهري",
};

interface Props {
  period: ReportPeriodValue;
  referenceDate: string;
  onPeriodChange: (p: ReportPeriodValue) => void;
  onDateChange: (d: string) => void;
  rangeLabel: string;
}

export function DoctorReportFilters({
  period,
  referenceDate,
  onPeriodChange,
  onDateChange,
  rangeLabel,
}: Props) {
  return (
    <div dir="rtl" className="flex flex-wrap items-center gap-3 rounded-lg border p-4">
      <div className="flex gap-2">
        {(Object.keys(PERIOD_LABELS) as ReportPeriodValue[]).map((p) => (
          <Button
            key={p}
            type="button"
            variant={p === period ? "default" : "outline"}
            size="sm"
            onClick={() => onPeriodChange(p)}
          >
            {PERIOD_LABELS[p]}
          </Button>
        ))}
      </div>

      <Input
        type="date"
        value={referenceDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-auto"
      />

      <span className="text-sm text-muted-foreground">{rangeLabel}</span>
    </div>
  );
}
