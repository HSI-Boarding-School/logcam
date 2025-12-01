import api from "@/lib/api";
import { API_BASE } from "@/lib/config";
import { UserProfile, UserRole } from "@/types/users";

// GET /users/
export async function fetchUsers(): Promise<UserProfile[]> {
  const res = await api.get(`${API_BASE}/users/`);
  return res.data;
}

// GET /users/:id
export async function fetchUserById(userId: string): Promise<UserProfile[]> {
  const res = await api.get(`${API_BASE}/users/${userId}`);
  return res.data;
}

// DELETE /users/:id
export async function deleteUserById(userId: string) {
  await api.delete(`${API_BASE}/users/${userId}`);
}

// PUT /users/:id/roles
export async function updateUserRoles(
  userId: string,
  roles: UserRole[]
): Promise<UserProfile> {
  const res = await api.put(`${API_BASE}/users/${userId}/roles`, { roles });
  return res.data;
}

// PUT /users/:id
export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile> {
  const res = await api.put(`${API_BASE}/users/${userId}`, data);
  return res.data;
}

// POST /users/
export async function createUser(
  data: Omit<UserProfile, "id" | "created_at">
): Promise<UserProfile> {
  const res = await api.post(`${API_BASE}/users/`, data);
  return res.data;
}
