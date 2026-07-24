"use client";

import { useDashboardSummary } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CARDS: { key: keyof ReturnType<typeof metricLabels>; label: string; money?: boolean }[] = [
  { key: "today_revenue", label: "إيراد اليوم", money: true },
  { key: "monthly_revenue", label: "إيراد الشهر", money: true },
  { key: "total_patients", label: "إجمالي المرضى" },
  { key: "total_forms", label: "إجمالي الفورمات" },
  { key: "total_doctors", label: "عدد الأطباء" },
  { key: "total_services", label: "عدد الخدمات" },
  { key: "total_expenses", label: "مصروفات الشهر", money: true },
  { key: "net_profit", label: "صافي الربح", money: true },
  { key: "pending_payments", label: "مدفوعات معلّقة", money: true },
  { key: "doctor_commissions_total", label: "عمولات الأطباء (الشهر)", money: true },
];

// Dummy helper purely for TS key inference above
function metricLabels() {
  return {} as {
    today_revenue: number;
    monthly_revenue: number;
    total_patients: number;
    total_forms: number;
    total_doctors: number;
    total_services: number;
    total_expenses: number;
    net_profit: number;
    pending_payments: number;
    doctor_commissions_total: number;
  };
}

export function DashboardSummary() {
  const { data, isLoading } = useDashboardSummary();

  return (
    <div dir="rtl" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map((card) => (
        <Card key={card.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-normal text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <p className="text-xl font-bold">
                {data[card.key].toLocaleString()}
                {card.money ? " ج.م" : ""}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
