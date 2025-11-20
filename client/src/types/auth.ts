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
  email?: string;
  role?: string;
  branch_id: number;
  branch_name: string;
}

export interface Students {
  id: number;
  name: string;
  tipe_class: string;
  branch_id: number;
  branch_name: string;
}
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: User;
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
  // login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  login;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;
