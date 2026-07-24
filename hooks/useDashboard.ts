import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/services/dashboard.service";

export function useDashboardSummary() {
  return useQuery({ queryKey: ["dashboard"], queryFn: getDashboardSummary });
}
