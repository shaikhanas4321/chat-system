import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { InputField, PrimaryButton } from '../components/AuthFormComponents';
import { authService, extractErrorMessage } from '../services/authService';
import './AuthPages.css';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password validation rules
  const hasMinLen = formData.password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(formData.password);

  const strengthScore = [hasMinLen, hasLetter, hasNumber, hasSpecial].filter(Boolean).length;

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await authService.register({
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      navigate('/verify-otp', {
        state: {
          email: response?.email || formData.email.trim(),
        },
      });
    } catch (err) {
      const friendlyMsg = extractErrorMessage(
        err,
        'Could not create account. Please check your credentials and try again.'
      );
      setApiError(friendlyMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Sign up with your email to start communicating seamlessly"
    >
      {apiError && (
        <div className="status-banner banner-danger" role="alert">
          <AlertCircle size={16} className="status-banner-icon" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <InputField
          label="Email address"
          id="register-email"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          icon={Mail}
          autoComplete="email"
          required
          autoFocus
        />

        <InputField
          label="Password"
          id="register-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 characters"
          value={formData.password}
          onChange={handleChange('password')}
          error={errors.password}
          icon={Lock}
          endIcon={showPassword ? EyeOff : Eye}
          onEndIconClick={() => setShowPassword(!showPassword)}
          autoComplete="new-password"
          required
        />

        {formData.password && (
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
              <span className={`checklist-item ${hasSpecial ? 'valid' : ''}`}>
                <Check size={12} /> Special character
              </span>
            </div>
          </div>
        )}

        <InputField
          label="Confirm password"
          id="register-confirm-password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          icon={Shield}
          endIcon={showConfirmPassword ? EyeOff : Eye}
          onEndIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
          autoComplete="new-password"
          required
        />

        <div className="form-submit-wrapper">
          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
            icon={ArrowRight}
          >
            Create account
          </PrimaryButton>
        </div>

        <div className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
