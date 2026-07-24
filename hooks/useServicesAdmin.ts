import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as servicesService from "@/services/services.service";
import type { ServiceInput } from "@/services/services.service";

export function useServicesList() {
  return useQuery({ queryKey: ["services-admin"], queryFn: servicesService.getServices });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ServiceInput) => servicesService.createService(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services-admin"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ServiceInput }) =>
      servicesService.updateService(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services-admin"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services-admin"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}
