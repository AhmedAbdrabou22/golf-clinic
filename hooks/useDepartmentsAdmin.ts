import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as departmentsService from "@/services/departments.service";

export function useDepartmentsList() {
  return useQuery({ queryKey: ["departments"], queryFn: departmentsService.getDepartments });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => departmentsService.createDepartment(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      departmentsService.updateDepartment(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentsService.deleteDepartment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}
