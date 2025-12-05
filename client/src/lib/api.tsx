// lib/axios.ts
import axios, { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

interface AuthStorage {
  state: {
    token: string | null;
    branchId: number | null;
  };
}

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStorageString = localStorage.getItem("auth-storage");

    if (authStorageString) {
      try {
        const authStorage: AuthStorage = JSON.parse(authStorageString);
        const { branchId } = authStorage.state;

        const token = localStorage.getItem("token");

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (branchId && config.headers) {
          config.headers["X-Branch-ID"] = branchId.toString();
        }
      } catch (error) {
        console.error("Error parsing auth storage:", error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jangan redirect kalau error dari login endpoint
    const isLoginRequest = originalRequest?.url?.includes("/auth/login");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoginRequest // ← PENTING: Exclude login
    ) {
      originalRequest._retry = true;

      // Clear auth & redirect ke login
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
