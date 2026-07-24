import { useQuery } from "@tanstack/react-query";
import {
  getDoctorReportDetail,
  getDoctorsReportSummary,
} from "@/services/doctorReports.service";

export function useDoctorsReportSummary(from: string, to: string) {
  return useQuery({
    queryKey: ["doctor-reports", "summary", from, to],
    queryFn: () => getDoctorsReportSummary(from, to),
  });
}

export function useDoctorReportDetail(doctorId: string | null, from: string, to: string) {
  return useQuery({
    queryKey: ["doctor-reports", "detail", doctorId, from, to],
    queryFn: () => getDoctorReportDetail(doctorId as string, from, to),
    enabled: !!doctorId,
  });
}
