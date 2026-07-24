"use client";

import { useState } from "react";
import { useCashTransactions, useCashBalance } from "@/hooks/useCashbox";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/validations/settings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExpenseDialog } from "./ExpenseDialog";

export function CashboxView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: transactions, isLoading } = useCashTransactions();
  const { data: balance } = useCashBalance();

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <Card className="w-full max-w-xs">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">الرصيد الحالي</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{(balance ?? 0).toLocaleString()} ج.م</p>
          </CardContent>
        </Card>
        <Button onClick={() => setDialogOpen(true)}>إضافة مصروف</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>التاريخ</TableHead>
            <TableHead>النوع</TableHead>
            <TableHead>الوصف</TableHead>
            <TableHead>المبلغ</TableHead>
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
          {transactions?.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{tx.transaction_date}</TableCell>
              <TableCell>
                <Badge variant={tx.type === "income" ? "default" : "destructive"}>
                  {tx.type === "income" ? "دخل" : "مصروف"}
                </Badge>
              </TableCell>
              <TableCell>
                {tx.description ??
                  (tx.related_form
                    ? `فورم ${tx.related_form.form_number}`
                    : tx.related_expense
                      ? EXPENSE_CATEGORY_LABELS[tx.related_expense.category]
                      : "-")}
              </TableCell>
              <TableCell className={tx.type === "income" ? "text-green-600" : "text-red-500"}>
                {tx.type === "income" ? "+" : "-"}
                {tx.amount.toLocaleString()} ج.م
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
