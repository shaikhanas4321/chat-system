import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AtSign, ArrowRight, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { InputField, PrimaryButton } from '../components/AuthFormComponents';
import { authService, extractErrorMessage } from '../services/authService';
import './AuthPages.css';

export default function SetUsername() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!username.trim()) {
      setError('Username cannot be empty');
      return false;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username may only contain letters, numbers, and underscores');
      return false;
    }
    setError('');
    return true;
  };

  const handleChange = (e) => {
    setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
    if (error) setError('');
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await authService.setUsername({ username: username.trim() });
      navigate('/dashboard', {
        state: { welcomeMessage: `Username set to @${username.trim()}!` },
      });
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        'Username already exists. Please choose a different username.'
      );
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Choose your username"
      subtitle="Select a unique username to identify yourself in conversations"
    >
      {apiError && (
        <div className="status-banner banner-danger" role="alert">
          <AlertCircle size={16} className="status-banner-icon" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <InputField
          label="Username"
          id="set-username-field"
          type="text"
          placeholder="e.g. alex"
          value={username}
          onChange={handleChange}
          error={error}
          icon={AtSign}
          autoComplete="username"
          required
          autoFocus
          helperText="3-30 characters, letters, numbers and underscores only"
        />

        <div className="form-submit-wrapper">
          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
            icon={ArrowRight}
          >
            Continue to dashboard
          </PrimaryButton>
        </div>
      </form>
    </AuthLayout>
  );
}
