import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as patientsService from "@/services/patients.service";
import type { PatientFormValues } from "@/lib/validations/patient";

export function usePatients(search?: string) {
  return useQuery({
    queryKey: ["patients", search ?? ""],
    queryFn: () => patientsService.getPatients(search),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: () => patientsService.getPatientById(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PatientFormValues) => patientsService.createPatient(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
  });
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PatientFormValues) => patientsService.updatePatient(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientsService.deletePatient(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
  });
}
