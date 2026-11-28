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

      navigate('/verify-reset-otp', {
        state: {
          username: username.trim(),
          email: response?.email || '',
          message: response?.message || 'A verification code has been sent to your email.',
        },
      });
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        'No user found with this username. Please check your username and try again.'
      );
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your username and we'll send a verification code to your email"
    >
      <div className="status-banner banner-info">
        <Info size={16} className="status-banner-icon" />
        <span>
          A 6-digit recovery code will be dispatched to the email associated with your username.
        </span>
      </div>

      {apiError && (
        <div className="status-banner banner-danger" role="alert">
          <AlertCircle size={16} className="status-banner-icon" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <InputField
          label="Username"
          id="forgot-username"
          type="text"
          placeholder="e.g. alex"
          value={username}
          onChange={handleChange}
          error={error}
          icon={User}
          autoComplete="username"
          required
          autoFocus
          helperText="Enter the username associated with your account"
        />

        <div className="form-submit-wrapper">
          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
            icon={ArrowRight}
          >
            Send verification code
          </PrimaryButton>
        </div>

        <div className="otp-back-row">
          <Link to="/login" className="btn-back-link">
            <ArrowLeft size={13} /> Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
