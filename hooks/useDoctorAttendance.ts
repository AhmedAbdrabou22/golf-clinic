import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as attendanceService from "@/services/doctorAttendance.service";
import type { AttendanceInput } from "@/services/doctorAttendance.service";

export function useDoctorAttendance(doctorId: string) {
  return useQuery({
    queryKey: ["doctor-attendance", doctorId],
    queryFn: () => attendanceService.getDoctorAttendance(doctorId),
    enabled: !!doctorId,
  });
}

export function useLogAttendance(doctorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: AttendanceInput) => attendanceService.logAttendance(doctorId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-attendance", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}