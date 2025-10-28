/**
 * Auth Store (T038)
 *
 * Zustand store for authentication state with persist middleware.
 * Manages JWT tokens, user data, company_id, role, and trial status.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// Types
// =============================================================================

export type AccountTier = 'trial' | 'verified' | 'premium';
export type UserRole = 'admin' | 'bzr_officer' | 'hr_manager' | 'viewer';

export interface User {
  userId: number;
  email: string;
  role: UserRole;
  companyId: number | null;
  firstName?: string;
  lastName?: string;

  // Trial Account Support (FR-028)
  accountTier: AccountTier;
  trialExpiryDate?: string | null; // ISO date string
  emailVerified: boolean;
}

export interface TrialStatus {
  isTrial: boolean;
  daysRemaining: number | null;
  expired: boolean;
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

  // Computed getters
  getTrialStatus: () => TrialStatus;
}

// =============================================================================
// Store
// =============================================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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

      // Get trial status (computed)
      getTrialStatus: () => {
        const { user } = get();

        if (!user || user.accountTier !== 'trial') {
          return { isTrial: false, daysRemaining: null, expired: false };
        }

        if (!user.trialExpiryDate) {
          return { isTrial: true, daysRemaining: null, expired: false };
        }

        const now = new Date();
        const expiryDate = new Date(user.trialExpiryDate);
        const msRemaining = expiryDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

        return {
          isTrial: true,
          daysRemaining: Math.max(0, daysRemaining),
          expired: daysRemaining <= 0,
        };
      },
    }),
    {
      name: 'bzr-auth-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        refreshToken: state.refreshToken,
        // Do NOT persist accessToken (expires in 15min)
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
export const selectCompanyId = (state: AuthState) => state.user?.companyId;
export const selectTrialStatus = (state: AuthState) => state.getTrialStatus();
