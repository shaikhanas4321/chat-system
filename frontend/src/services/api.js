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
    return `Server responded with status ${error.response.status}.`;
  }

  if (error.request) {
    return 'Unable to connect to the backend server. Make sure the backend server is running on port 8000.';
  }

  return error.message || defaultMessage;
}

export default api;