import api, { extractErrorMessage } from './api';

export { extractErrorMessage };

export const authService = {
  /**
   * Register a new user
   * @param {{ email: string, password: string, confirmPassword: string }} data
   */
  async register(data) {
    const response = await api.post('/accounts/register/', {
      email: data.email.trim(),
      password: data.password,
      confirm_password: data.confirmPassword || data.confirm_password,
    });
    return response.data;
  },

  /**
   * Verify registration OTP
   * @param {{ email: string, otp: string }} data
   */
  async verifyOtp(data) {
    const response = await api.post('/accounts/verify-otp/', {
      email: data.email.trim(),
      otp: data.otp.trim(),
    });
    return response.data;
  },

  /**
   * Log in user (TokenObtainPair with email as USERNAME_FIELD)
   * Accepts identifier as email or username
   * @param {{ identifier: string, password: string }} data
   */
  async login(data) {
    const payload = {
      email: data.identifier ? data.identifier.trim() : (data.email || '').trim(),
      password: data.password,
    };
    const response = await api.post('/accounts/login/', payload);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  },

  /**
   * Request password reset OTP for username
   * @param {{ username: string }} data
   */
  async forgotPassword(data) {
    const response = await api.post('/accounts/forgot-password/', {
      username: data.username.trim(),
    });
    return response.data;
  },

  /**
   * Verify password reset OTP
   * @param {{ username: string, otp: string }} data
   */
  async verifyForgotPasswordOtp(data) {
    const response = await api.post('/accounts/verify-forgot-otp/', {
      username: data.username.trim(),
      otp: data.otp.trim(),
    });
    return response.data;
  },

  /**
   * Set new password using reset token
   * @param {{ reset_token: string, new_password: string, confirm_password: string }} data
   */
  async setPassword(data) {
    const response = await api.post('/accounts/set-password/', {
      reset_token: data.reset_token,
      new_password: data.new_password,
      confirm_password: data.confirm_password,
    });
    return response.data;
  },

  /**
   * Set or update username for logged in user
   * @param {{ username: string }} data
   */
  async setUsername(data) {
    const token = localStorage.getItem('access_token');
    const response = await api.post(
      '/accounts/set-username/',
      { username: data.username.trim() },
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    );
    return response.data;
  },

  /**
   * Get user profile
   */
  async getProfile() {
    const token = localStorage.getItem('access_token');
    const response = await api.get('/accounts/profile/', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  /**
   * Log out
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};
