import api from "@/lib/api";
import { API_BASE } from "@/lib/config";
import { Students } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useStudent(selectedBranch?: number) {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  return useQuery({
    queryKey: ["students", user?.role, user?.branch_id, selectedBranch],
    queryFn: async () => {
      const res = await api.get(`${API_BASE}/students/all`);

      const allData: Students[] = res.data.users;

      if (user?.role === "TEACHER") {
        return allData.filter((s) => s.branch_id === user.branch_id);
      }

      if (user?.role === "ADMIN") {
        return selectedBranch
          ? allData.filter((s) => s.branch_id === Number(selectedBranch))
          : allData;
      }

      return [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
