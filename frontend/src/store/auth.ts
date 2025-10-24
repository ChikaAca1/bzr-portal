/**
 * Auth Store (T023)
 *
 * Zustand store for authentication state with persist middleware.
 * Stores JWT tokens and user data.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// Types
// =============================================================================

export interface User {
  userId: number;
  email: string;
  role: 'admin' | 'bzr_officer' | 'hr_manager' | 'viewer';
  companyId: number | null;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateAccessToken: (accessToken: string) => void;
}

// =============================================================================
// Store
// =============================================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // Login action
      login: (accessToken, refreshToken, user) =>
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
        }),

      // Logout action
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),

      // Update user data
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      // Update access token (after refresh)
      updateAccessToken: (accessToken) =>
        set({
          accessToken,
        }),
    }),
    {
      name: 'bzr-auth-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        refreshToken: state.refreshToken,
        // Do NOT persist accessToken (expires quickly)
      }),
    }
  )
);

// =============================================================================
// Selectors (for performance)
// =============================================================================

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectAccessToken = (state: AuthState) => state.accessToken;
export const selectUserRole = (state: AuthState) => state.user?.role;
