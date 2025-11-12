// types/auth.ts

export interface Branch {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  branch_id: number;
  branch?: Branch;
  role?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expires_in?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  branchId: number | null;
  branchName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;