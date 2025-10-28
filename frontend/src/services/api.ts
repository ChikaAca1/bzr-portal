/**
 * API Client (T040)
 *
 * Axios-based API client with JWT interceptor and error handling.
 * Also exports tRPC client for type-safe procedure calls.
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/api/trpc/router';
import superjson from 'superjson';
import { useAuthStore } from '../stores/authStore';

// =============================================================================
// Configuration
// =============================================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// =============================================================================
// Axios Instance (T040)
// =============================================================================

/**
 * Axios instance with JWT authentication and error handling
 */
export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies
});

/**
 * Request interceptor: Attach JWT token to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle 401 Unauthorized (token refresh)
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until token refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, updateAccessToken, logout } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        // Refresh access token
        const response = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
        const { accessToken } = response.data;

        updateAccessToken(accessToken);
        processQueue(null);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(error);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors with Serbian messages
    return Promise.reject(enhanceError(error));
  }
);

/**
 * Enhance error with user-friendly Serbian messages
 */
function enhanceError(error: AxiosError): Error & { status?: number; data?: unknown } {
  const status = error.response?.status;
  const data = error.response?.data;

  let message = 'Дошло је до грешке при комуникацији са сервером';

  if (status === 400) {
    message = 'Неважећи захтев';
  } else if (status === 401) {
    message = 'Нисте аутентификовани';
  } else if (status === 403) {
    message = 'Немате дозволу за ову акцију';
  } else if (status === 404) {
    message = 'Тражени ресурс није пронађен';
  } else if (status === 429) {
    message = 'Превише захтева. Покушајте поново касније.';
  } else if (status && status >= 500) {
    message = 'Серверска грешка. Покушајте поново.';
  } else if (error.code === 'ECONNABORTED') {
    message = 'Захтев је истекао. Проверите интернет везу.';
  } else if (error.code === 'ERR_NETWORK') {
    message = 'Грешка при повезивању. Проверите интернет везу.';
  }

  // Extract server error message if available
  if (data && typeof data === 'object' && 'message' in data) {
    message = (data as { message: string }).message;
  }

  const enhancedError = new Error(message) as Error & { status?: number; data?: unknown };
  enhancedError.status = status;
  enhancedError.data = data;

  return enhancedError;
}

// =============================================================================
// tRPC Client (existing)
// =============================================================================

export const trpc = createTRPCReact<AppRouter>();

export function getTRPCClient() {
  return trpc.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${API_URL}/trpc`,
        headers() {
          const accessToken = useAuthStore.getState().accessToken;
          return accessToken ? { authorization: `Bearer ${accessToken}` } : {};
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          });
        },
      }),
    ],
  });
}
