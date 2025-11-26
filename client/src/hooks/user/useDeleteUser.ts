import { deleteUserById } from "@/services/usersService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteUserById() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteUserById,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
