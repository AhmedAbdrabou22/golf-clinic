// "use client";

// import { useState } from "react";
// import { usePatientForms, useMarkFormAsPaid } from "@/hooks/usePatientForms";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { PatientVisitFormDialog } from "./PatientVisitFormDialog";
// import { toast } from "sonner";

// interface PatientFormsListProps {
//   patientId: string;
// }

// export function PatientFormsList({ patientId }: PatientFormsListProps) {
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const { data: forms, isLoading } = usePatientForms(patientId);
//   const markAsPaid = useMarkFormAsPaid(patientId);

//   const handleMarkPaid = async (formId: string) => {
//     try {
//       await markAsPaid.mutateAsync(formId);
//       toast.success("تم تسجيل الدفع — تم تحديث الكاش والعمولة تلقائيًا");
//     } catch {
//       toast.error("تعذر تسجيل الدفع");
//     }
//   };

//   return (
//     <div dir="rtl" className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold">فورمات الزيارات</h3>
//         <Button onClick={() => setDialogOpen(true)}>فورم زيارة جديد</Button>
//       </div>

//       {isLoading && <p className="text-muted-foreground">جاري التحميل...</p>}
//       {!isLoading && forms?.length === 0 && (
//         <p className="text-muted-foreground">لا توجد فورمات لهذا المريض بعد</p>
//       )}

//       <div className="grid gap-3">
//         {forms?.map((form) => (
//           <Card key={form.id}>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-base">
//                 {form.form_number} — {form.service.name}
//               </CardTitle>
//               <Badge variant={form.payment_status === "paid" ? "default" : "secondary"}>
//                 {form.payment_status === "paid" ? "مدفوع" : "قيد الانتظار"}
//               </Badge>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
//                 <span>الدكتور: {form.doctor.name}</span>
//                 <span>القسم: {form.department.name}</span>
//                 <span>سعر العميل: {form.customer_price} ج.م</span>
//                 <span>عمولة الدكتور: {form.doctor_commission} ج.م</span>
//               </div>

//               <div className="space-y-1">
//                 <div className="flex justify-between text-sm">
//                   <span>الجلسات</span>
//                   <span>
//                     {form.completed_sessions} / {form.sessions_count}
//                   </span>
//                 </div>
//                 <Progress
//                   value={(form.completed_sessions / form.sessions_count) * 100}
//                 />
//               </div>

//               {form.payment_status === "pending" && (
//                 <Button
//                   size="sm"
//                   onClick={() => handleMarkPaid(form.id)}
//                   disabled={markAsPaid.isPending}
//                 >
//                   تسجيل كمدفوع
//                 </Button>
//               )}
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <PatientVisitFormDialog
//         open={dialogOpen}
//         onOpenChange={setDialogOpen}
//         patientId={patientId}
//       />
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { usePatientForms } from "@/hooks/usePatientForms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PatientVisitFormDialog } from "./PatientVisitFormDialog";
import { CompleteSessionDialog } from "./CompleteSessionDialog";
import type { Session } from "@/types/database.types";

interface PatientFormsListProps {
  patientId: string;
}

export function PatientFormsList({ patientId }: PatientFormsListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionTarget, setSessionTarget] = useState<{
    session: Session;
    formId: string;
    remainingBalance: number;
  } | null>(null);
  const { data: forms, isLoading } = usePatientForms(patientId);

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">فورمات الزيارات</h3>
        <Button onClick={() => setDialogOpen(true)}>فورم زيارة جديد</Button>
      </div>

      {isLoading && <p className="text-muted-foreground">جاري التحميل...</p>}
      {!isLoading && forms?.length === 0 && (
        <p className="text-muted-foreground">لا توجد فورمات لهذا المريض بعد</p>
      )}

      <div className="grid gap-3">
        {forms?.map((form) => {
          const paidSoFar = form.sessions.reduce((sum, s) => sum + Number(s.amount_paid ?? 0), 0);
          const remainingBalance = Number(form.customer_price) - paidSoFar;
          const sortedSessions = [...form.sessions].sort(
            (a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
          );

          return (
            <Card key={form.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">
                  {form.form_number} — {form.service.name}
                </CardTitle>
                <Badge variant={form.payment_status === "paid" ? "default" : "secondary"}>
                  {form.payment_status === "paid" ? "مدفوع بالكامل" : "قيد التحصيل"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>الدكتور: {form.doctor.name}</span>
                  <span>القسم: {form.department.name}</span>
                  <span>سعر العميل: {form.customer_price} ج.م</span>
                  <span>باقي المطلوب: {remainingBalance.toLocaleString()} ج.م</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>الجلسات</span>
                    <span>
                      {form.completed_sessions} / {form.sessions_count}
                    </span>
                  </div>
                  <Progress value={(form.completed_sessions / form.sessions_count) * 100} />
                </div>

                {sortedSessions.length > 0 && (
                  <div className="space-y-1 rounded-md border p-2">
                    {sortedSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <span className="flex items-center gap-2">
                          {session.session_date}
                          {session.status === "completed" ? (
                            <Badge variant="secondary">
                              مكتملة{session.is_last_session ? " (أخيرة)" : ""} —{" "}
                              {session.amount_paid.toLocaleString()} ج.م
                            </Badge>
                          ) : (
                            <Badge variant="outline">مجدولة</Badge>
                          )}
                        </span>
                        {session.status !== "completed" && form.payment_status !== "paid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setSessionTarget({ session, formId: form.id, remainingBalance })
                            }
                          >
                            إكمال الجلسة
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <PatientVisitFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        patientId={patientId}
      />

      {sessionTarget && (
        <CompleteSessionDialog
          open={!!sessionTarget}
          onOpenChange={(open) => !open && setSessionTarget(null)}
          sessionId={sessionTarget.session.id}
          formId={sessionTarget.formId}
          patientId={patientId}
          remainingBalance={sessionTarget.remainingBalance}
        />
      )}
    </div>
  );
}