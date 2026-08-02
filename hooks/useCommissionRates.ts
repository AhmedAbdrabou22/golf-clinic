"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as commissionService from "@/services/commissionRates";
import type {
  DoctorCommissionRateFormValues,
  DoctorTargetBonusFormValues,
} from "@/lib/validations/commission";

export function useCommissionCategories() {
  return useQuery({
    queryKey: ["commission-categories"],
    queryFn: commissionService.fetchCommissionCategories,
  });
}

export function useCreateCommissionCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => commissionService.createCommissionCategory(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["commission-categories"] }),
  });
}

export function useDoctorCommissionRates(doctorId: string | null) {
  return useQuery({
    queryKey: ["doctor-commission-rates", doctorId],
    queryFn: () => commissionService.fetchDoctorCommissionRates(doctorId as string),
    enabled: !!doctorId,
  });
}

export function useCreateDoctorCommissionRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: DoctorCommissionRateFormValues) =>
      commissionService.createDoctorCommissionRate(values),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["doctor-commission-rates", variables.doctor_id],
      }),
  });
}

export function useDeleteDoctorCommissionRate(doctorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commissionService.deleteDoctorCommissionRate(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["doctor-commission-rates", doctorId] }),
  });
}

export function useDoctorTargetBonusRule(doctorId: string | null) {
  return useQuery({
    queryKey: ["doctor-target-bonus", doctorId],
    queryFn: () => commissionService.fetchDoctorTargetBonusRule(doctorId as string),
    enabled: !!doctorId,
  });
}

export function useUpsertDoctorTargetBonusRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      values,
      existingId,
    }: {
      values: DoctorTargetBonusFormValues;
      existingId?: string;
    }) => commissionService.upsertDoctorTargetBonusRule(values, existingId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["doctor-target-bonus", variables.values.doctor_id],
      }),
  });
}

export function useDoctorCompletedSessionsThisMonth(doctorId: string | null) {
  return useQuery({
    queryKey: ["doctor-completed-sessions-month", doctorId],
    queryFn: () =>
      commissionService.fetchDoctorCompletedSessionsThisMonth(doctorId as string),
    enabled: !!doctorId,
  });
}

export function useUpdateServiceCommissionCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      serviceId,
      commissionCategoryId,
    }: {
      serviceId: string;
      commissionCategoryId: string | null;
    }) => commissionService.updateServiceCommissionCategory(serviceId, commissionCategoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services-simple-list"] });
    },
  });
}
