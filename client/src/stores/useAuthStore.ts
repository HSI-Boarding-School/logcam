// stores/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import authService from "@/services/authService";
import type { AuthStore, LoginCredentials } from "@/types/auth";

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      branchId: null,
      branchName: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const res = await authService.login(credentials);
          console.log("RESPONSE LOGIN : ",res)

          localStorage.setItem("token", res.access_token);
          localStorage.setItem("user", JSON.stringify(res.user));

          set({
            user: res.user,
            token: res.access_token,
            branchId: res.user.branch_id,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (err) {
          set({
            error: "Email atau password salah",
            isLoading: false,
            isAuthenticated: false,
          });

          return false
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            token: null,
            branchId: null,
            branchName: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      initialize: async () => {
        const { token } = get();

        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          const user = await authService.getCurrentUser();
          set({
            user,
            branchId: user.branch_id,
            branchName: user.branch_name || null,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Initialize error:", error);
          get().logout();
        }
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        branchId: state.branchId,
        branchName: state.branchName,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
