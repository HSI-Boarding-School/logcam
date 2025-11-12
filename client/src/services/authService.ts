// services/authService.ts
import api from "@/lib/api";
import type { LoginCredentials, LoginResponse, User } from "types/auth";

const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(
      "/api/auth/login",
      credentials
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get<User>("/api/auth/me");
    return data;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const { data } = await api.post<{ token: string }>("/api/auth/refresh");
    return data;
  },

  verifyToken: async (): Promise<{ valid: boolean }> => {
    try {
      const { data } = await api.get<{ valid: boolean }>("/api/auth/verify");
      return data;
    } catch (error) {
      return { valid: false };
    }
  },
};

export default authService;
