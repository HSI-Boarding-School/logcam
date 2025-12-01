export interface UserProfile {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  branch_id: number;
  created_at: string;
  role: string;
}

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";
