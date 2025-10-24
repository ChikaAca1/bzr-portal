/**
 * API Client Utility (T025)
 *
 * Centralized API client with JWT header injection and error handling.
 * Uses fetch API with automatic token management.
 */

import { useAuthStore } from '../store/auth';

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);

// =============================================================================
// Types
// =============================================================================

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
  requiresAuth?: boolean;
}

// =============================================================================
// Error Handling
// =============================================================================

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<ApiError> {
  try {
    const data = await response.json();
    return {
      error: data.error || 'Unknown Error',
      message: data.message || 'Дошло је до грешке',
      statusCode: response.status,
      details: data,
    };
  } catch {
    return {
      error: 'Network Error',
      message: 'Грешка при комуникацији са сервером',
      statusCode: response.status,
    };
  }
}

// =============================================================================
// API Client
// =============================================================================

/**
 * Make HTTP request with automatic token injection
 *
 * @param endpoint - API endpoint (e.g., '/api/companies')
 * @param config - Request configuration
 * @returns Promise with response data
 * @throws ApiError on HTTP errors
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { timeout = API_TIMEOUT, requiresAuth = true, ...fetchConfig } = config;

  // Build full URL
  const url = `${API_BASE_URL}${endpoint}`;

  // Prepare headers
  const headers = new Headers(fetchConfig.headers);

  // Add Content-Type if not present
  if (!headers.has('Content-Type') && fetchConfig.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Add JWT token if authentication required
  if (requiresAuth) {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  // Setup timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchConfig,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      // Handle 401 Unauthorized - logout user
      if (response.status === 401) {
        useAuthStore.getState().logout();
      }

      const error = await parseErrorResponse(response);
      throw error;
    }

    // Parse response
    const contentType = response.headers.get('Content-Type');

    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    // Return blob for binary data (e.g., document downloads)
    if (contentType?.includes('application/vnd.openxmlformats')) {
      return (await response.blob()) as T;
    }

    // Return text for other types
    return (await response.text()) as T;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw {
        error: 'Timeout',
        message: 'Захтев је истекао. Покушајте поново.',
        statusCode: 408,
      } as ApiError;
    }

    // Re-throw ApiError
    if ((error as ApiError).statusCode) {
      throw error;
    }

    // Generic network error
    throw {
      error: 'Network Error',
      message: 'Грешка при повезивању са сервером',
      statusCode: 0,
    } as ApiError;
  }
}

// =============================================================================
// Convenience Methods
// =============================================================================

/**
 * GET request
 */
export async function get<T = unknown>(
  endpoint: string,
  config?: RequestConfig
): Promise<T> {
  return apiRequest<T>(endpoint, { ...config, method: 'GET' });
}

/**
 * POST request
 */
export async function post<T = unknown>(
  endpoint: string,
  data?: unknown,
  config?: RequestConfig
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...config,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request
 */
export async function put<T = unknown>(
  endpoint: string,
  data?: unknown,
  config?: RequestConfig
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...config,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH request
 */
export async function patch<T = unknown>(
  endpoint: string,
  data?: unknown,
  config?: RequestConfig
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...config,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request
 */
export async function del<T = unknown>(
  endpoint: string,
  config?: RequestConfig
): Promise<T> {
  return apiRequest<T>(endpoint, { ...config, method: 'DELETE' });
}

// =============================================================================
// File Upload
// =============================================================================

/**
 * Upload file (multipart/form-data)
 */
export async function uploadFile<T = unknown>(
  endpoint: string,
  formData: FormData,
  config?: RequestConfig
): Promise<T> {
  // Don't set Content-Type header - browser will set it with boundary
  const headers = new Headers(config?.headers);
  headers.delete('Content-Type');

  return apiRequest<T>(endpoint, {
    ...config,
    method: 'POST',
    body: formData,
    headers,
  });
}
