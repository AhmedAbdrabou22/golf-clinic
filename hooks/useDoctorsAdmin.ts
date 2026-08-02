// hooks/useDoctorsAdmin.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { doctorsService } from "@/services/doctors.service";
import type { DoctorFormValues } from "@/lib/validations/settings";

export function useDoctorsList() {
  return useQuery({ queryKey: ["doctors-admin"], queryFn: doctorsService.getDoctors });
}

export function useDoctor(id: string | null) {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: () => doctorsService.getDoctorById(id as string),
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: DoctorFormValues) => doctorsService.createDoctor(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors-admin"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: DoctorFormValues }) =>
      doctorsService.updateDoctor(id, values),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctors-admin"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor", variables.id] });
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