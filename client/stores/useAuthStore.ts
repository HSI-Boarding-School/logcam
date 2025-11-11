// stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../src/services/authService';
import type { AuthStore, LoginCredentials } from '../types/auth';

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
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.login(credentials);
          
          set({
            user: response.user,
            token: response.token,
            branchId: response.user.branch_id,
            branchName: response.user.branch?.name || null,
            isAuthenticated: true,
            isLoading: false,
          });

          return response;
        } catch (error) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Login failed';
          
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
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
            branchName: user.branch?.name || null,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Initialize error:', error);
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
      name: 'auth-storage',
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