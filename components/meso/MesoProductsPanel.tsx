"use client";

import { useState } from "react";
import { useMesoProducts, useDeleteMesoProduct } from "@/hooks/useMesoProducts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import { MesoProductDialog } from "./MesoProductDialog";
import type { MesoProduct } from "@/services/mesoProducts";
import { toast } from "sonner";

export function MesoProductsPanel() {
  const { data: products, isLoading } = useMesoProducts();
  const deleteProduct = useDeleteMesoProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MesoProduct | undefined>(undefined);

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("تم حذف المنتج");
    } catch {
      toast.error("حصل خطأ، حاول تاني");
    }
  };

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">منتجات الميزو والفيلر</h1>
        <Button
          onClick={() => {
            setEditingProduct(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="ml-2 h-4 w-4" />
          إضافة منتج
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المنتج</TableHead>
            <TableHead>الشركة</TableHead>
            <TableHead>سعر نص ملي</TableHead>
            <TableHead>سعر ملي كامل</TableHead>
            <TableHead className="text-left">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                جاري التحميل...
              </TableCell>
            </TableRow>
          )}
          {products?.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.company ?? "—"}</TableCell>
              <TableCell>
                {product.price_half_ml != null ? `${product.price_half_ml.toLocaleString()} ج.م` : "—"}
              </TableCell>
              <TableCell>
                {product.price_1ml != null ? `${product.price_1ml.toLocaleString()} ج.م` : "—"}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingProduct(product);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <MesoProductDialog open={dialogOpen} onOpenChange={setDialogOpen} product={editingProduct} />
    </div>
  );
}
