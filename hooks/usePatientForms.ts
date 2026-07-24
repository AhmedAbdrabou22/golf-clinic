// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import * as formsService from "@/services/forms.service";
// import type { PatientVisitFormValues } from "@/lib/validations/patient";

// export function usePatientForms(patientId: string) {
//   return useQuery({
//     queryKey: ["patient-forms", patientId],
//     queryFn: () => formsService.getFormsByPatient(patientId),
//     enabled: !!patientId,
//   });
// }

// export function useForm(id: string) {
//   return useQuery({
//     queryKey: ["form", id],
//     queryFn: () => formsService.getFormById(id),
//     enabled: !!id,
//   });
// }

// export function useSearchForms(query: string) {
//   return useQuery({
//     queryKey: ["forms-search", query],
//     queryFn: () => formsService.searchForms(query),
//     enabled: query.length > 1,
//   });
// }

// export function useCreatePatientForm(patientId: string) {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (values: PatientVisitFormValues) =>
//       formsService.createPatientForm(patientId, values),
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: ["patient-forms", patientId] }),
//   });
// }

// export function useMarkFormAsPaid(patientId: string) {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (formId: string) => formsService.markFormAsPaid(formId),
//     onSuccess: () => {
//       // Paying a form also affects cashbox + commissions dashboards elsewhere
//       queryClient.invalidateQueries({ queryKey: ["patient-forms", patientId] });
//       queryClient.invalidateQueries({ queryKey: ["dashboard"] });
//       queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
//       queryClient.invalidateQueries({ queryKey: ["doctor-commissions"] });
//     },
//   });
// }

// export function useCompleteSession(formId: string, patientId: string) {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (sessionId: string) => formsService.completeSession(sessionId, formId),
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: ["patient-forms", patientId] }),
//   });
// }

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as formsService from "@/services/forms.service";
import type { PatientVisitFormValues } from "@/lib/validations/patient";

export function usePatientForms(patientId: string) {
  return useQuery({
    queryKey: ["patient-forms", patientId],
    queryFn: () => formsService.getFormsByPatient(patientId),
    enabled: !!patientId,
  });
}

export function useForm(id: string) {
  return useQuery({
    queryKey: ["form", id],
    queryFn: () => formsService.getFormById(id),
    enabled: !!id,
  });
}

export function useSearchForms(query: string) {
  return useQuery({
    queryKey: ["forms-search", query],
    queryFn: () => formsService.searchForms(query),
    enabled: query.length > 1,
  });
}

export function useCreatePatientForm(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PatientVisitFormValues) =>
      formsService.createPatientForm(patientId, values),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["patient-forms", patientId] }),
  });
}

export function useCompleteSessionWithPayment(formId: string, patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      input,
    }: {
      sessionId: string;
      input: formsService.CompleteSessionInput;
    }) => formsService.completeSessionWithPayment(sessionId, formId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-forms", patientId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cash-balance"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-commissions"] });
    },
  });
}