import { fetchUserById } from "@/services/usersService";
import { useQuery } from "@tanstack/react-query";

export function useUSerById(userId: string) {
  return useQuery({
    queryKey: ['userById', userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId
  })
}