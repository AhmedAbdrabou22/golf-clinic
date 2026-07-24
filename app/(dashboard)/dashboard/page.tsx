import { DashboardSummary } from "@/components/dashboard/DashboardSummary";

export default function DashboardPage() {
  return (
    <div dir="rtl" className="space-y-6 p-6">
      <h1 className="text-xl font-bold">لوحة التحكم</h1>
      <DashboardSummary />
    </div>
  );
}
