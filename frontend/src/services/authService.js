/**
 * Auth Service Stub
 *
 * Prepared for connection to Django REST Framework backend.
 * Do NOT mock or invent live responses here yet; keep clean signature references.
 */

export const authService = {
  /**
   * Register a new user
   * @param {{ email: string, password: string, confirmPassword: string }} data
   */
  async register(data) {
    // To be connected to DRF API endpoint (e.g., /api/auth/register/)
    console.debug('authService.register called with:', { email: data.email });
    return Promise.resolve({ success: true, email: data.email });
  },

  /**
   * Verify registration OTP
   * @param {{ email: string, otp: string }} data
   */
  async verifyOtp(data) {
    // To be connected to DRF API endpoint (e.g., /api/auth/verify-otp/)
    console.debug('authService.verifyOtp called with:', data);
    return Promise.resolve({ success: true });
  },

  /**
   * Resend OTP verification code
   * @param {{ email: string }} data
   */
  async resendOtp(data) {
    // To be connected to DRF API endpoint (e.g., /api/auth/resend-otp/)
    console.debug('authService.resendOtp called with:', data);
    return Promise.resolve({ success: true });
  },

  /**
   * Log in user
   * @param {{ email: string, password: string }} data
   */
  async login(data) {
    // To be connected to DRF API endpoint (e.g., /api/auth/login/ or /api/token/)
    console.debug('authService.login called with:', { email: data.email });
    return Promise.resolve({ success: true });
  }
};
