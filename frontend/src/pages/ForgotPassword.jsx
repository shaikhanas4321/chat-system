import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ArrowRight, ArrowLeft, AlertCircle, Info } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { InputField, PrimaryButton } from '../components/AuthFormComponents';
import { authService, extractErrorMessage } from '../services/authService';
import './AuthPages.css';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    setError('');
    return true;
  };

  const handleChange = (e) => {
    setUsername(e.target.value);
    if (error) setError('');
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const response = await authService.forgotPassword({
        username: username.trim(),
      });

      // Navigate to OTP verification page passing username and associated email
      navigate('/verify-reset-otp', {
        state: {
          username: username.trim(),
          email: response?.email || '',
          message: response?.message || 'A 6-digit OTP has been sent to your email address.',
        },
      });
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        'Could not locate account with this username. Please verify the handle and try again.'
      );
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Recover password"
      subtitle="Enter your username to receive a secure password recovery code"
      stepText="Step 01 / Identity Verification"
      showcaseHighlight="Account recovery is governed by single-use, time-delimited cryptographic tokens."
    >
      {/* Information card explaining the email dispatch mechanism */}
      <div className="status-banner banner-info">
        <Info size={17} className="status-banner-icon" />
        <span>
          A one-time verification code (OTP) will be sent to the email address registered with this username.
        </span>
      </div>

      {apiError && (
        <div className="status-banner banner-danger" role="alert">
          <AlertCircle size={17} className="status-banner-icon" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <InputField
          label="Your Registered Username"
          id="forgot-username"
          type="text"
          placeholder="e.g. alex_chen or handle"
          value={username}
          onChange={handleChange}
          error={error}
          icon={User}
          autoComplete="username"
          required
          autoFocus
          helperText="Enter the exact handle assigned to your Chat System account"
        />

        <div className="form-submit-wrapper">
          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
            icon={ArrowRight}
          >
            Dispatch Verification Code
          </PrimaryButton>
        </div>

        <div className="otp-back-row">
          <Link to="/login" className="btn-back-link">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
