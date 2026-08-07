"use client";

import { useMemo, useState } from "react";
import {
  useMedicationsList,
  useMedicationSales,
  useDeleteMedication,
  useDeleteMedicationSale,
} from "@/hooks/useMedications";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus, ShoppingCart } from "lucide-react";
import { MedicationDialog } from "./MedicationDialog";
import { MedicationSaleDialog } from "./MedicationSaleDialog";
import { CommissionRecipientsCard } from "./CommissionRecipientsCard";
import type { Medication } from "@/services/medications";
import { toast } from "sonner";

function monthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  return { from, to };
}

export function MedicationsView() {
  const { from, to } = useMemo(monthRange, []);
  const { data: medications, isLoading: loadingMeds } = useMedicationsList();
  const { data: sales, isLoading: loadingSales } = useMedicationSales(from, to);
  const deleteMedication = useDeleteMedication();
  const deleteSale = useDeleteMedicationSale();

  const [medDialogOpen, setMedDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | undefined>(undefined);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);

  const handleDeleteMed = async (id: string) => {
    try {
      await deleteMedication.mutateAsync(id);
      toast.success("تم حذف الدواء");
    } catch {
      toast.error("حصل خطأ، حاول تاني");
    }
  };

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">الأدوية — قسم التغذية</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSaleDialogOpen(true)}>
            <ShoppingCart className="ml-2 h-4 w-4" />
            تسجيل بيع
          </Button>
          <Button
            onClick={() => {
              setEditingMed(undefined);
              setMedDialogOpen(true);
            }}
          >
            <Plus className="ml-2 h-4 w-4" />
            إضافة دواء
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">قائمة الأدوية</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>سعر البيع</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingMeds && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                )}
                {medications?.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell>{med.selling_price.toLocaleString()} ج.م</TableCell>
                    <TableCell className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingMed(med);
                          setMedDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteMed(med.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* <CommissionRecipientsCard /> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">مبيعات الشهر الحالي</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الدواء</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>المريض</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingSales && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              )}
              {sales?.length === 0 && !loadingSales && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    مفيش مبيعات مسجلة الشهر ده
                  </TableCell>
                </TableRow>
              )}
              {sales?.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.sale_date}</TableCell>
                  <TableCell>{sale.medication?.name ?? "—"}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>{sale.patient?.name ?? "—"}</TableCell>
                  <TableCell className="text-left">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSale.mutate(sale.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MedicationDialog open={medDialogOpen} onOpenChange={setMedDialogOpen} medication={editingMed} />
      <MedicationSaleDialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen} />
    </div>
  );
}
