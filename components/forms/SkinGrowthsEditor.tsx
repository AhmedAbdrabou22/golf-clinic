"use client";

import { useEffect, useState } from "react";
import { useSkinGrowth, useUpsertSkinGrowth } from "@/hooks/useFormAddons";
import { estimateSkinGrowthPrice } from "@/lib/validations/meso";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SkinGrowthsEditorProps {
  formId: string;
}

/**
 * محرر زوائد جلدية — أول زايدة 500ج، وكل زيادة بعدها +200ج.
 * استخدمه جوه فورم الجلدية لما الأوبشن "زوائد جلدية" يتفعّل.
 */
export function SkinGrowthsEditor({ formId }: SkinGrowthsEditorProps) {
  const { data: skinGrowth } = useSkinGrowth(formId);
  const upsertCount = useUpsertSkinGrowth(formId);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (skinGrowth) setCount(skinGrowth.count);
  }, [skinGrowth]);

  const estimatedTotal = estimateSkinGrowthPrice(count);

  const handleSave = async () => {
    try {
      await upsertCount.mutateAsync(count);
      toast.success("تم حفظ عدد الزوائد الجلدية والسعر");
    } catch {
      toast.error("حصل خطأ، حاول تاني");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">زوائد جلدية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">عدد الزوائد</label>
            <Input
              type="number"
              min={0}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>
          <Button type="button" onClick={handleSave} disabled={upsertCount.isPending}>
            حفظ
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          أول زايدة 500 ج.م، وكل زايدة زيادة بعدها +200 ج.م.
        </p>

        <div className="flex justify-between border-t pt-3 text-sm font-bold">
          <span>الإجمالي</span>
          <span>{estimatedTotal.toLocaleString()} ج.م</span>
        </div>
      </CardContent>
    </Card>
  );
}
