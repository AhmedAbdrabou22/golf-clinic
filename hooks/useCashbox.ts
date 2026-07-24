import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as cashboxService from "@/services/cashbox.service";
import type { ExpenseInput } from "@/services/cashbox.service";

export function useCashTransactions() {
  return useQuery({
    queryKey: ["cash-transactions"],
    queryFn: cashboxService.getCashTransactions,
  });
}

export function useCashBalance() {
  return useQuery({ queryKey: ["cash-balance"], queryFn: cashboxService.getCashBalance });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ExpenseInput) => cashboxService.createExpense(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cash-balance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
