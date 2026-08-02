"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as mesoService from "@/services/mesoProducts";
import type { MesoProductFormValues } from "@/lib/validations/meso";

export function useMesoProducts() {
  return useQuery({ queryKey: ["meso-products"], queryFn: mesoService.fetchMesoProducts });
}

export function useCreateMesoProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: MesoProductFormValues) => mesoService.createMesoProduct(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meso-products"] }),
  });
}

export function useUpdateMesoProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: MesoProductFormValues }) =>
      mesoService.updateMesoProduct(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meso-products"] }),
  });
}

export function useDeleteMesoProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mesoService.deleteMesoProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meso-products"] }),
  });
}
