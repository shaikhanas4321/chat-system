import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, AlertCircle, ShieldCheck, Check } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { InputField, PrimaryButton } from '../components/AuthFormComponents';
import { authService, extractErrorMessage } from '../services/authService';
import './AuthPages.css';

export default function SetNewPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve reset_token forwarded from VerifyResetOtp
  const resetToken = location.state?.reset_token || '';
  const username = location.state?.username || '';

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password validation criteria
  const hasMinLen = formData.newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(formData.newPassword);
  const hasNumber = /\d/.test(formData.newPassword);
  const hasSpecial = /[^a-zA-Z0-9]/.test(formData.newPassword);
  const isMatch = formData.newPassword && formData.newPassword === formData.confirmPassword;

  const strengthScore = [hasMinLen, hasLetter, hasNumber, hasSpecial].filter(Boolean).length;

  const validate = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Both passwords must match exactly';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!resetToken) {
      setApiError('Missing password reset authorization token. Please restart the recovery flow.');
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      await authService.setPassword({
        reset_token: resetToken,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      });

      // Show beautiful success state
      setIsSuccess(true);
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        'Could not reset password. The reset token may have expired. Please try again.'
      );
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={isSuccess ? "Password updated" : "Set new password"}
      subtitle={
        isSuccess
          ? "Your credentials have been re-encrypted and secured."
          : `Define new credentials for @${username || 'your account'}`
      }
      stepText="Step 03 / Credential Mutation"
      showcaseHighlight="PBKDF2 SHA-256 one-way cryptographic hashing protects stored credentials."
    >
      {/* If successfully reset, render celebratory confirmation state */}
      {isSuccess ? (
        <div className="success-card-block">
          <div className="success-icon-gem">
            <CheckCircle2 size={30} />
          </div>
          <h3>Password Successfully Reset</h3>
          <p>
            Your account authentication credentials have been securely updated in the database.
            You can now sign in using your new password.
          </p>

          <PrimaryButton
            type="button"
            onClick={() =>
              navigate('/login', {
                state: {
                  verifiedMessage: 'Password successfully updated! Please sign in with your new password.',
                  prefillEmail: username,
                },
              })
            }
            icon={ArrowRight}
          >
            Sign In to Account
          </PrimaryButton>
        </div>
      ) : (
        <>
          {apiError && (
            <div className="status-banner banner-danger" role="alert">
              <AlertCircle size={17} className="status-banner-icon" />
              <span>{apiError}</span>
            </div>
          )}

          {!resetToken && (
            <div className="status-banner banner-danger">
              <AlertCircle size={17} className="status-banner-icon" />
              <span>No reset token detected. You must first verify your recovery code.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <InputField
              label="New Password"
              id="set-new-password"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={formData.newPassword}
              onChange={handleChange('newPassword')}
              error={errors.newPassword}
              icon={Lock}
              endIcon={showNewPassword ? EyeOff : Eye}
              onEndIconClick={() => setShowNewPassword(!showNewPassword)}
              autoComplete="new-password"
              required
              autoFocus
            />

            {formData.newPassword && (
              <div className="password-strength-container">
                <div className="strength-bar-track">
                  <span
                    className={`strength-segment ${
                      strengthScore >= 1
                        ? strengthScore <= 2
                          ? 'active-weak'
                          : strengthScore === 3
                          ? 'active-medium'
                          : 'active-strong'
                        : ''
                    }`}
                  />
                  <span
                    className={`strength-segment ${
                      strengthScore >= 2
                        ? strengthScore === 2
                          ? 'active-weak'
                          : strengthScore === 3
                          ? 'active-medium'
                          : 'active-strong'
                        : ''
                    }`}
                  />
                  <span
                    className={`strength-segment ${
                      strengthScore >= 3
                        ? strengthScore === 3
                          ? 'active-medium'
                          : 'active-strong'
                        : ''
                    }`}
                  />
                  <span
                    className={`strength-segment ${
                      strengthScore === 4 ? 'active-strong' : ''
                    }`}
                  />
                </div>
                <div className="password-checklist">
                  <span className={`checklist-item ${hasMinLen ? 'valid' : ''}`}>
                    <Check size={12} /> Min. 8 characters
                  </span>
                  <span className={`checklist-item ${hasLetter ? 'valid' : ''}`}>
                    <Check size={12} /> Letters
                  </span>
                  <span className={`checklist-item ${hasNumber ? 'valid' : ''}`}>
                    <Check size={12} /> Numbers
                  </span>
                  <span className={`checklist-item ${isMatch && formData.confirmPassword ? 'valid' : ''}`}>
                    <Check size={12} /> Passwords match
                  </span>
                </div>
              </div>
            )}

            <InputField
              label="Confirm New Password"
              id="set-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-type your new password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={errors.confirmPassword}
              icon={ShieldCheck}
              endIcon={showConfirmPassword ? EyeOff : Eye}
              onEndIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
              autoComplete="new-password"
              required
            />

            <div className="form-submit-wrapper">
              <PrimaryButton
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting || !resetToken}
                icon={ArrowRight}
              >
                Save New Password & Sign In
              </PrimaryButton>
            </div>

            <div className="otp-back-row">
              <Link to="/login" className="btn-back-link">
                Cancel and return to Sign In
              </Link>
            </div>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
