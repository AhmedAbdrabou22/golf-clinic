"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as medicationsService from "@/services/medications";
import type {
  MedicationFormValues,
  MedicationSaleFormValues,
  MedicationCommissionRecipientFormValues,
} from "@/lib/validations/medications";

export function useMedicationsList() {
  return useQuery({ queryKey: ["medications"], queryFn: medicationsService.fetchMedications });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: MedicationFormValues) => medicationsService.createMedication(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: MedicationFormValues }) =>
      medicationsService.updateMedication(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicationsService.deleteMedication(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });
}

export function useMedicationSales(from: string, to: string) {
  return useQuery({
    queryKey: ["medication-sales", from, to],
    queryFn: () => medicationsService.fetchMedicationSales(from, to),
  });
}

export function useCreateMedicationSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: MedicationSaleFormValues) =>
      medicationsService.createMedicationSale(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medication-sales"] });
      queryClient.invalidateQueries({ queryKey: ["staff-commission-earned"] });
    },
  });
}

export function useDeleteMedicationSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicationsService.deleteMedicationSale(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medication-sales"] }),
  });
}

export function useMedicationCommissionRecipients() {
  return useQuery({
    queryKey: ["medication-commission-recipients"],
    queryFn: medicationsService.fetchMedicationCommissionRecipients,
  });
}

export function useCreateMedicationCommissionRecipient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: MedicationCommissionRecipientFormValues) =>
      medicationsService.createMedicationCommissionRecipient(values),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["medication-commission-recipients"] }),
  });
}

export function useUpdateMedicationCommissionRecipient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount_per_unit }: { id: string; amount_per_unit: number }) =>
      medicationsService.updateMedicationCommissionRecipient(id, amount_per_unit),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["medication-commission-recipients"] }),
  });
}

export function useDeleteMedicationCommissionRecipient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicationsService.deleteMedicationCommissionRecipient(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["medication-commission-recipients"] }),
  });
}
