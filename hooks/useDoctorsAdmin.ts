import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as doctorsService from "@/services/doctors.service";
import type { DoctorInput } from "@/services/doctors.service";

export function useDoctorsList() {
  return useQuery({ queryKey: ["doctors-admin"], queryFn: doctorsService.getDoctors });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: DoctorInput) => doctorsService.createDoctor(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors-admin"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: DoctorInput }) =>
      doctorsService.updateDoctor(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors-admin"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => doctorsService.deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors-admin"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}
