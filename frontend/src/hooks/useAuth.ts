/**
 * Auth Hooks (T039)
 *
 * Custom hooks for authentication operations:
 * - login: Authenticate user with email/password
 * - logout: Clear session and tokens
 * - refresh: Refresh access token using refresh token
 * - trial status: Check trial expiry and limits
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore, type User } from '../stores/authStore';
import { apiClient } from '../services/api';

// =============================================================================
// Types
// =============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

// =============================================================================
// API Calls
// =============================================================================

async function loginApi(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return response.data;
}

async function logoutApi(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
}

async function refreshTokenApi(refreshToken: string): Promise<RefreshResponse> {
  const response = await apiClient.post<RefreshResponse>('/auth/refresh', { refreshToken });
  return response.data;
}

async function fetchCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * useLogin hook
 *
 * Authenticate user and store tokens + user data in Zustand store.
 *
 * @example
 * ```tsx
 * const { mutate: login, isPending, error } = useLogin();
 *
 * const handleLogin = () => {
 *   login(
 *     { email: 'korisnik@primer.rs', password: 'lozinka123' },
 *     {
 *       onSuccess: () => navigate('/dashboard'),
 *       onError: (err) => toast.error(err.message),
 *     }
 *   );
 * };
 * ```
 */
export function useLogin() {
  const { login: storeLogin } = useAuthStore();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      // Store tokens and user data
      storeLogin(data.accessToken, data.refreshToken, data.user);
    },
  });
}

/**
 * useLogout hook
 *
 * Invalidate refresh token on server and clear local session.
 *
 * @example
 * ```tsx
 * const { mutate: logout } = useLogout();
 *
 * const handleLogout = () => {
 *   logout(undefined, {
 *     onSuccess: () => navigate('/login'),
 *   });
 * };
 * ```
 */
export function useLogout() {
  const { refreshToken, logout: storeLogout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    },
    onSettled: () => {
      // Always clear local state (even if server request fails)
      storeLogout();
    },
  });
}

/**
 * useRefreshToken hook
 *
 * Refresh access token using refresh token.
 * Call this when receiving 401 Unauthorized responses.
 *
 * @example
 * ```tsx
 * const { mutate: refreshToken } = useRefreshToken();
 *
 * // In API interceptor
 * if (error.response?.status === 401) {
 *   refreshToken(undefined, {
 *     onSuccess: () => retryOriginalRequest(),
 *     onError: () => navigate('/login'),
 *   });
 * }
 * ```
 */
export function useRefreshToken() {
  const { refreshToken, updateAccessToken, logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (!refreshToken) {
        throw new Error('Нема токена за освежавање');
      }
      return refreshTokenApi(refreshToken);
    },
    onSuccess: (data) => {
      updateAccessToken(data.accessToken);
    },
    onError: () => {
      // Refresh token expired - logout user
      logout();
    },
  });
}

/**
 * useCurrentUser hook
 *
 * Fetch current user data from server (for data refresh).
 *
 * @example
 * ```tsx
 * const { data: user, isLoading } = useCurrentUser();
 *
 * if (isLoading) return <Spinner />;
 * return <div>Добродошли, {user?.firstName}!</div>;
 * ```
 */
export function useCurrentUser() {
  const { isAuthenticated, updateUser } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      // Update Zustand store with fresh data
      updateUser(data);
    },
  });
}

/**
 * useTrialStatus hook
 *
 * Get trial account status (days remaining, expired, limits).
 *
 * @example
 * ```tsx
 * const { isTrial, daysRemaining, expired } = useTrialStatus();
 *
 * return (
 *   <>
 *     {isTrial && !expired && (
 *       <Banner>Пробни налог - {daysRemaining} дана преостало</Banner>
 *     )}
 *     {expired && <UpgradePrompt />}
 *   </>
 * );
 * ```
 */
export function useTrialStatus() {
  const getTrialStatus = useAuthStore((state) => state.getTrialStatus);
  return getTrialStatus();
}

/**
 * useAuth hook (convenience hook combining all auth operations)
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout, trialStatus } = useAuth();
 * ```
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const trialStatus = useTrialStatus();

  const { mutate: login, isPending: isLoggingIn, error: loginError } = useLogin();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { mutate: refresh } = useRefreshToken();

  return {
    // State
    user,
    isAuthenticated,
    trialStatus,

    // Actions
    login,
    logout,
    refresh,

    // Loading states
    isLoggingIn,
    isLoggingOut,
    loginError,
  };
}
