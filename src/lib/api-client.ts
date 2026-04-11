/**
 * API Client with centralized error handling
 * 
 * Implements Requirement 34: Error Handling and Toast Notifications
 * - Wraps all API calls with consistent error handling
 * - Displays toast notifications for errors
 * - Handles network errors gracefully
 * - Parses error responses from API
 */

import { toast } from 'sonner';

interface ApiError {
  message: string;
  status: number;
}

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.error || data.message || 'An error occurred';
  } catch {
    return response.statusText || 'An error occurred';
  }
}

/**
 * Get user-friendly error message based on status code
 */
function getUserFriendlyMessage(status: number, message: string): string {
  switch (status) {
    case 400:
      return message || 'Invalid request. Please check your input.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 408:
      return 'Request timeout. Please try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again.';
    default:
      return message || 'Something went wrong. Please try again.';
  }
}

/**
 * Check if the error is a network error
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes('fetch') || error.message.includes('network');
  }
  return false;
}

interface ApiCallOptions extends RequestInit {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

/**
 * Make an API call with error handling
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options with additional toast configuration
 * @returns Promise with parsed JSON response
 * @throws ApiClientError on error
 */
export async function apiCall<T = unknown>(
  url: string,
  options: ApiCallOptions = {}
): Promise<T> {
  const {
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
    ...fetchOptions
  } = options;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      const userMessage = getUserFriendlyMessage(response.status, errorMessage);

      if (showErrorToast) {
        toast.error(userMessage);
      }

      throw new ApiClientError(userMessage, response.status);
    }

    // Parse successful response
    const data = await response.json();

    // Show success toast if configured
    if (showSuccessToast && successMessage) {
      toast.success(successMessage);
    }

    return data as T;
  } catch (error) {
    // Handle network errors
    if (isNetworkError(error)) {
      const networkMessage = 'Network error. Please check your connection and try again.';
      if (showErrorToast) {
        toast.error(networkMessage);
      }
      throw new ApiClientError(networkMessage, 0);
    }

    // Re-throw ApiClientError
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Handle unexpected errors
    const unexpectedMessage = 'An unexpected error occurred. Please try again.';
    if (showErrorToast) {
      toast.error(unexpectedMessage);
    }
    throw new ApiClientError(unexpectedMessage, 500);
  }
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T = unknown>(url: string, options?: ApiCallOptions) =>
    apiCall<T>(url, { ...options, method: 'GET' }),

  post: <T = unknown>(url: string, body?: unknown, options?: ApiCallOptions) =>
    apiCall<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = unknown>(url: string, body?: unknown, options?: ApiCallOptions) =>
    apiCall<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(url: string, body?: unknown, options?: ApiCallOptions) =>
    apiCall<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(url: string, options?: ApiCallOptions) =>
    apiCall<T>(url, { ...options, method: 'DELETE' }),
};
