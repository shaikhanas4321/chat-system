import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { InputField, PrimaryButton, GoogleButton } from '../components/AuthFormComponents';
import { authService, extractErrorMessage } from '../services/authService';
import './AuthPages.css';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: location.state?.prefillEmail || '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Message passed from OTP verification or password reset flows
  const verifiedMessage = location.state?.verifiedMessage;

  const validate = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email address or username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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

    setIsSubmitting(true);
    setApiError('');

    try {
      await authService.login({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });

      // Fetch user profile to check if username is set
      try {
        const profile = await authService.getProfile();
        if (!profile.username) {
          navigate('/set-username');
        } else {
          navigate('/dashboard');
        }
      } catch {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        'Invalid credentials. Please verify your email/username and password.'
      );
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = () => {
    alert('Google OAuth sign-in will initialize your secure federated identity.');
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Authenticate your session to access conversations and channels"
      stepText="Account Access"
      showcaseHighlight="Hardware-accelerated transport layer with instant socket synchronization."
    >
      {verifiedMessage && (
        <div className="status-banner banner-success">
          <CheckCircle2 size={17} className="status-banner-icon" />
          <span>{verifiedMessage}</span>
        </div>
      )}

      {apiError && (
        <div className="status-banner banner-danger" role="alert">
          <AlertCircle size={17} className="status-banner-icon" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Google Sign-in */}
      <div className="social-auth-section">
        <GoogleButton onClick={handleGoogleClick} label="Sign in with Google Workspace" />
      </div>

      <div className="auth-divider">
        <span>or sign in with credentials</span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <InputField
          label="Email Address or Username"
          id="login-identifier"
          type="text"
          placeholder="name@domain.com or handle"
          value={formData.identifier}
          onChange={handleChange('identifier')}
          error={errors.identifier}
          icon={Mail}
          autoComplete="username"
          required
          autoFocus={!formData.identifier}
        />

        <InputField
          label="Password"
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your security password"
          value={formData.password}
          onChange={handleChange('password')}
          error={errors.password}
          icon={Lock}
          endIcon={showPassword ? EyeOff : Eye}
          onEndIconClick={() => setShowPassword(!showPassword)}
          autoComplete="current-password"
          required
          rightAction={
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot password?
            </Link>
          }
        />

        <div className="form-submit-wrapper">
          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
            icon={ArrowRight}
          >
            Authenticate Session
          </PrimaryButton>
        </div>

        <div className="auth-switch">
          Don't have an active account?{' '}
          <Link to="/register">Create one in seconds</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
