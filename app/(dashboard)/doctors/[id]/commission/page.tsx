"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { CommissionRatesPanel } from "@/components/doctors/CommissionRatesPanel";
import { TargetBonusPanel } from "@/components/doctors/TargetBonusPanel";
import { Skeleton } from "@/components/ui/skeleton";

// جلب بيانات دكتور واحد — لو عندك useDoctor(id) جاهز في hooks/useDoctors.ts استخدمه بدل ده
function useDoctorSimple(id: string) {
  return useQuery({
    queryKey: ["doctor-simple", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, department_id, employment_type")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export default function DoctorCommissionPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data: doctor, isLoading } = useDoctorSimple(id);

  if (isLoading) return <Skeleton className="h-40 w-full m-6" />;

  return (
    <div dir="rtl" className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">عمولة الدكتور — {doctor?.name ?? ""}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <CommissionRatesPanel doctorId={id} />
        <TargetBonusPanel doctorId={id} />
      </div>
    </div>
  );
}
