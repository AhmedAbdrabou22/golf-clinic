"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as staffService from "@/services/staff";
import type {
  StaffFormValues,
  StaffSessionCommissionRuleFormValues,
} from "@/lib/validations/staff";

export function useStaffList() {
  return useQuery({ queryKey: ["staff"], queryFn: staffService.fetchStaff });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: StaffFormValues) => staffService.createStaff(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: StaffFormValues }) =>
      staffService.updateStaff(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffService.deleteStaff(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useStaffCommissionRules(staffId: string | null) {
  return useQuery({
    queryKey: ["staff-commission-rules", staffId],
    queryFn: () => staffService.fetchStaffCommissionRules(staffId as string),
    enabled: !!staffId,
  });
}

export function useCreateStaffCommissionRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: StaffSessionCommissionRuleFormValues) =>
      staffService.createStaffCommissionRule(values),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["staff-commission-rules", variables.staff_id],
      }),
  });
}

export function useDeleteStaffCommissionRule(staffId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffService.deleteStaffCommissionRule(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["staff-commission-rules", staffId] }),
  });
}

export function useStaffCommissionEarned(staffId: string | null, from: string, to: string) {
  return useQuery({
    queryKey: ["staff-commission-earned", staffId, from, to],
    queryFn: () => staffService.fetchStaffCommissionEarned(staffId as string, from, to),
    enabled: !!staffId,
  });
}
