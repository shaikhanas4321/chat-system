import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token automatically if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and signal session expiration if not on an auth endpoint
      const isAuthEndpoint = error.config?.url?.includes('/accounts/login/') ||
                             error.config?.url?.includes('/accounts/register/') ||
                             error.config?.url?.includes('/accounts/verify-otp/') ||
                             error.config?.url?.includes('/accounts/forgot-password/') ||
                             error.config?.url?.includes('/accounts/verify-forgot-otp/') ||
                             error.config?.url?.includes('/accounts/set-password/');

      if (!isAuthEndpoint) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Let the app know session is expired
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Format API error responses uniformly
 * Extracts Django DRF error messages into human-friendly strings
 */
export function extractErrorMessage(error, defaultMessage = 'An unexpected error occurred. Please try again.') {
  if (!error) return defaultMessage;

  if (error.response) {
    const data = error.response.data;
    if (typeof data === 'string') {
      return data;
    }
    if (Array.isArray(data)) {
      return data.join(' ');
    }
    if (typeof data === 'object' && data !== null) {
      if (data.detail && typeof data.detail === 'string') {
        return data.detail;
      }
      if (data.message && typeof data.message === 'string') {
        return data.message;
      }
      if (data.error && typeof data.error === 'string') {
        return data.error;
      }
      if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
        return data.non_field_errors.join(' ');
      }
      // Combine multiple field errors
      const messages = Object.entries(data)
        .map(([field, msgs]) => {
          const text = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
          if (field === 'non_field_errors' || field === 'detail' || field === 'error') return text;
          const formattedField = field.replace(/_/g, ' ');
          return `${formattedField}: ${text}`;
        })
        .join(' • ');
      if (messages) return messages;
    }
    if (error.response.status === 404) return 'The requested resource was not found.';
    if (error.response.status === 403) return 'You do not have permission to access this resource.';
    if (error.response.status >= 500) return 'Server error. Please try again in a few moments.';
    return `Server responded with status ${error.response.status}.`;
  }

  if (error.request) {
    return 'Unable to reach the server. Make sure the backend server is running at http://127.0.0.1:8000.';
  }

  return error.message || defaultMessage;
}

export default api;
