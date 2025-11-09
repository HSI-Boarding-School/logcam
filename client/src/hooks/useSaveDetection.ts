import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useSaveFetection() {
  return useMutation({
    mutationFn: async (result: any[]) => {
      const { data } = await api.post("/detections", { result });
      return data
    },
  });
}
