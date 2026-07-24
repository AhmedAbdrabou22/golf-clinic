import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Department, Doctor, Service } from "@/types/database.types";

const supabase = createClient();

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*").order("name");
      if (error) throw error;
      return data as Department[];
    },
  });
}

export function useDoctors(departmentId?: string) {
  return useQuery({
    queryKey: ["doctors", departmentId ?? "all"],
    queryFn: async () => {
      let query = supabase.from("doctors").select("*").order("name");
      if (departmentId) query = query.eq("department_id", departmentId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Doctor[];
    },
  });
}

export function useServices(departmentId?: string) {
  return useQuery({
    queryKey: ["services", departmentId ?? "all"],
    queryFn: async () => {
      let query = supabase.from("services").select("*").order("name");
      if (departmentId) query = query.eq("department_id", departmentId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Service[];
    },
  });
}
