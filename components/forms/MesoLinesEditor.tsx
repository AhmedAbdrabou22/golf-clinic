"use client";

import { useMemo, useState } from "react";
import { useMesoProducts } from "@/hooks/useMesoProducts";
import { useMesoLines, useAddMesoLine, useDeleteMesoLine, useMesoTotal } from "@/hooks/useFormAddons";
import { estimateMesoLinePrice, MESO_QUANTITY_PRESETS } from "@/lib/validations/meso";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface MesoLinesEditorProps {
  formId: string;
}

/**
 * محرر جلسة الميزو — بيسمح بإضافة أكتر من منتج بكميات مختلفة (ربع/نص/ملي...)
 * في نفس الجلسة، والسعر بيتجمع تلقائي. استخدمه جوه فورم إضافة/تعديل الجلسة
 * لما الخدمة المختارة تكون "ميزو".
 */
export function MesoLinesEditor({ formId }: MesoLinesEditorProps) {
  const { data: products } = useMesoProducts();
  const { data: lines, isLoading } = useMesoLines(formId);
  const { data: total } = useMesoTotal(formId);
  const addLine = useAddMesoLine();
  const deleteLine = useDeleteMesoLine(formId);

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState<number>(0.5);
  const [price, setPrice] = useState<number>(0);

  const selectedProduct = useMemo(
    () => products?.find((p) => p.id === productId),
    [products, productId]
  );

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
    if (selectedProduct) {
      setPrice(estimateMesoLinePrice(value, selectedProduct.price_half_ml, selectedProduct.price_1ml));
    }
  };

  const handleProductChange = (id: string) => {
    setProductId(id);
    const product = products?.find((p) => p.id === id);
    if (product) {
      setPrice(estimateMesoLinePrice(quantity, product.price_half_ml, product.price_1ml));
    }
  };

  const handleAdd = async () => {
    if (!productId) {
      toast.error("اختار منتج الميزو الأول");
      return;
    }
    try {
      await addLine.mutateAsync({
        form_id: formId,
        meso_product_id: productId,
        quantity_ml: quantity,
        price,
      });
      setProductId("");
      setQuantity(0.5);
      setPrice(0);
    } catch {
      toast.error("حصل خطأ، حاول تاني");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">جلسة الميزو</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-5 space-y-1">
            <label className="text-sm font-medium">المنتج</label>
            <Select value={productId} onValueChange={handleProductChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختار المنتج" />
              </SelectTrigger>
              <SelectContent>
                {products?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.company ? `${p.company} — ${p.name}` : p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-3 space-y-1">
            <label className="text-sm font-medium">الكمية (ملي)</label>
            <Select
              value={String(quantity)}
              onValueChange={(v) => handleQuantityChange(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MESO_QUANTITY_PRESETS.map((q) => (
                  <SelectItem key={q} value={String(q)}>
                    {q} ملي
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-3 space-y-1">
            <label className="text-sm font-medium">السعر</label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div className="col-span-1">
            <Button type="button" onClick={handleAdd} disabled={addLine.isPending}>
              +
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">جاري التحميل...</p>}
          {lines?.map((line) => (
            <div
              key={line.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span>
                {line.meso_product?.name} — {line.quantity_ml} ملي
              </span>
              <div className="flex items-center gap-3">
                <span className="font-medium">{line.price.toLocaleString()} ج.م</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteLine.mutate(line.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between border-t pt-3 text-sm font-bold">
          <span>إجمالي الميزو</span>
          <span>{(total ?? 0).toLocaleString()} ج.م</span>
        </div>
      </CardContent>
    </Card>
  );
}
