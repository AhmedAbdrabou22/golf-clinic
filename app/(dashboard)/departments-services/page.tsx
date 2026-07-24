import { DepartmentsPanel } from "@/components/departments/DepartmentsPanel";
import { ServicesPanel } from "@/components/departments/ServicesPanel";

export default function DepartmentsServicesPage() {
  return (
    <div dir="rtl" className="space-y-6 p-6">
      <DepartmentsPanel />
      <ServicesPanel />
    </div>
  );
}
