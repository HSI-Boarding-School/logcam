import { API_BASE } from "@/lib/config";
import { Students } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useStudent(selectedBranch?: number) {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  return useQuery({
    queryKey: ['students', user?.role, user?.branch_id, selectedBranch],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/users/all`);
      const allData: Students[] = res.data.users;

      console.log("Fetched users:", allData);
      console.log("Current user:", user);

      if (user?.role === 'teacher') {
        return allData.filter(s => s.branch_id === user.branch_id);
      }

      if (user?.role === 'admin') {
        return selectedBranch
          ? allData.filter(s => s.branch_id === Number(selectedBranch))
          : allData;
      }

      return [];
    },
    enabled: !!user, 
    staleTime: 5 * 60 * 1000, 
  });
}