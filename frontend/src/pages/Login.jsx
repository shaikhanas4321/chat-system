import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { InputField, PrimaryButton, GoogleButton } from '../components/AuthFormComponents';
import './AuthPages.css';

export default function Login() {
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  // Message passed from OTP verification or other redirects
  const verifiedMessage = location.state?.verifiedMessage;

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // UI-only for now; ready for DRF endpoint integration
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Login clicked. Ready to connect to Django REST Framework backend!');
    }, 400);
  };

  const handleGoogleClick = () => {
    // UI-only for now
    alert('Google Sign-In clicked (UI only). Ready for OAuth integration!');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotPasswordNotice(true);
    setTimeout(() => setForgotPasswordNotice(false), 4000);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your conversations"
    >
      {verifiedMessage && (
        <div className="status-banner success-banner">
          <CheckCircle2 size={16} />
          <span>{verifiedMessage}</span>
        </div>
      )}

      {forgotPasswordNotice && (
        <div className="status-banner info-banner">
          <span>Password reset functionality will be enabled with backend integration.</span>
        </div>
      )}

      {/* Google Sign-In (UI Only) */}
      <div className="social-auth-section">
        <GoogleButton onClick={handleGoogleClick} label="Sign in with Google" />
      </div>

      <div className="auth-divider">
        <span>or sign in with email</span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <InputField
          label="Email Address"
          id="login-email"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          icon={Mail}
          autoComplete="email"
          required
        />

        <div className="password-header-row">
          <InputField
            label="Password"
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange('password')}
            error={errors.password}
            icon={Lock}
            endIcon={showPassword ? EyeOff : Eye}
            onEndIconClick={() => setShowPassword(!showPassword)}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="login-auxiliary-row">
          <div className="remember-placeholder" />
          <a
            href="#forgot-password"
            className="forgot-password-link"
            onClick={handleForgotPassword}
          >
            Forgot password?
          </a>
        </div>

        <div className="form-submit-wrapper">
          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
          >
            Sign In
          </PrimaryButton>
        </div>

        <div className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register">Create an account</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
