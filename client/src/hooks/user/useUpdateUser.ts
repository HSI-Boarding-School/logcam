import { updateUserProfile } from "@/services/usersService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      updateUserProfile(userId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
