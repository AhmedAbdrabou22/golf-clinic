// "use client";

// import { use } from "react";
// import { usePatient } from "@/hooks/usePatients";
// import { PatientFormsList } from "@/components/forms/PatientFormsList";
// import { Card, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";

// export default function PatientDetailPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = use(params);
//   const { data: patient, isLoading } = usePatient(id);

//   if (isLoading) return <Skeleton className="h-40 w-full" />;
//   if (!patient) return <p dir="rtl">المريض غير موجود</p>;

//   return (
//     <div dir="rtl" className="space-y-6 p-6">
//       <Card>
//         <CardContent className="pt-6 grid grid-cols-3 gap-4">
//           <div>
//             <p className="text-sm text-muted-foreground">الاسم</p>
//             <p className="font-medium">{patient.name}</p>
//           </div>
//           <div>
//             <p className="text-sm text-muted-foreground">السن</p>
//             <p className="font-medium">{patient.age ?? "-"}</p>
//           </div>
//           <div>
//             <p className="text-sm text-muted-foreground">التليفون</p>
//             <p className="font-medium">{patient.phone ?? "-"}</p>
//           </div>
//         </CardContent>
//       </Card>

//       <PatientFormsList patientId={id} />
//     </div>
//   );
// }

"use client";

import { usePatient } from "@/hooks/usePatients";
import { PatientFormsList } from "@/components/forms/PatientFormsList";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data: patient, isLoading } = usePatient(id);


  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!patient) return <p dir="rtl">المريض غير موجود</p>;

  return (
    <div dir="rtl" className="space-y-6 p-6">
      <Card>
        <CardContent className="pt-6 grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">الاسم</p>
            <p className="font-medium">{patient.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">السن</p>
            <p className="font-medium">{patient.age ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">التليفون</p>
            <p className="font-medium">{patient.phone ?? "-"}</p>
          </div>
        </CardContent>
      </Card>

      <PatientFormsList patientId={id} /> 
    </div>
  );
}