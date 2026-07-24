import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  disburseDoctorPayout,
  getDoctorPendingDues,
  type DisburseDoctorPayoutInput,
} from "@/services/doctor-payouts.service";

export function useDoctorPendingDues(
  doctorId: string,
  enabled = true
) {
  return useQuery({
    queryKey: ["doctor-pending-dues", doctorId],
    queryFn: () => getDoctorPendingDues(doctorId),
    enabled: enabled && !!doctorId,
  });
}

export function useDisburseDoctorPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: DisburseDoctorPayoutInput) =>
      disburseDoctorPayout(values),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["doctor-pending-dues", variables.doctorId],
      });

      queryClient.invalidateQueries({
        queryKey: ["doctor-reports"],
      });

      queryClient.invalidateQueries({
        queryKey: ["doctors"],
      });

      queryClient.invalidateQueries({
        queryKey: ["cash-transactions"],
      });

      queryClient.invalidateQueries({
        queryKey: ["cash-balance"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      queryClient.invalidateQueries({
        queryKey: ["doctor-payouts"],
      });
    },
  });
}