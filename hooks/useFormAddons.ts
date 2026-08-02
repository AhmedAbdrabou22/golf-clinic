"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as formAddonsService from "@/services/formAddons";
import type { MesoLineFormValues } from "@/lib/validations/meso";

export function useMesoLines(formId: string | null) {
  return useQuery({
    queryKey: ["form-meso-lines", formId],
    queryFn: () => formAddonsService.fetchMesoLines(formId as string),
    enabled: !!formId,
  });
}

export function useAddMesoLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: MesoLineFormValues) => formAddonsService.addMesoLine(values),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["form-meso-lines", variables.form_id] });
      queryClient.invalidateQueries({ queryKey: ["form-meso-total", variables.form_id] });
    },
  });
}

export function useDeleteMesoLine(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => formAddonsService.deleteMesoLine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-meso-lines", formId] });
      queryClient.invalidateQueries({ queryKey: ["form-meso-total", formId] });
    },
  });
}

export function useMesoTotal(formId: string | null) {
  return useQuery({
    queryKey: ["form-meso-total", formId],
    queryFn: () => formAddonsService.fetchMesoTotal(formId as string),
    enabled: !!formId,
  });
}

export function useSkinGrowth(formId: string | null) {
  return useQuery({
    queryKey: ["form-skin-growth", formId],
    queryFn: () => formAddonsService.fetchSkinGrowth(formId as string),
    enabled: !!formId,
  });
}

export function useUpsertSkinGrowth(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (count: number) => formAddonsService.upsertSkinGrowthCount(formId, count),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["form-skin-growth", formId] }),
  });
}
