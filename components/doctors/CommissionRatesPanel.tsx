"use client";

import { useState } from "react";
import { useDoctorCommissionRates, useDeleteDoctorCommissionRate } from "@/hooks/useCommissionRates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { CommissionRateDialog } from "./CommissionRateDialog";

interface CommissionRatesPanelProps {
  doctorId: string;
}

export function CommissionRatesPanel({ doctorId }: CommissionRatesPanelProps) {
  const { data: rates, isLoading } = useDoctorCommissionRates(doctorId);
  const deleteRate = useDeleteDoctorCommissionRate(doctorId);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">نسب العمولة حسب تصنيف الخدمة</CardTitle>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة نسبة
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التصنيف</TableHead>
              <TableHead>النسبة</TableHead>
              <TableHead>تسري من</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            )}
            {rates?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  مفيش نسب مضافة للدكتور ده لسه
                </TableCell>
              </TableRow>
            )}
            {rates?.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell className="font-medium">
                  {rate.commission_category?.name ?? "—"}
                </TableCell>
                <TableCell>{rate.percentage}%</TableCell>
                <TableCell>{rate.effective_from}</TableCell>
                <TableCell className="text-left">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRate.mutate(rate.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CommissionRateDialog open={dialogOpen} onOpenChange={setDialogOpen} doctorId={doctorId} />
    </Card>
  );
}
