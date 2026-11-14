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
        'Username is already taken. Please pick another unique handle.'
      );
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Claim your handle"
      subtitle="Choose a unique username to identify yourself across chats and direct messages"
      stepText="Profile Setup"
      showcaseHighlight="Handles are globally unique and indexable for instant peer discovery."
    >
      {apiError && (
        <div className="status-banner banner-danger" role="alert">
          <AlertCircle size={17} className="status-banner-icon" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <InputField
          label="Unique Username"
          id="set-username-field"
          type="text"
          placeholder="e.g. Satoshi, elon, dev_guru"
          value={username}
          onChange={handleChange}
          error={error}
          icon={AtSign}
          autoComplete="username"
          required
          autoFocus
          helperText="3-30 characters, lowercase letters, numbers, and underscores only"
        />

        <div className="form-submit-wrapper">
          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
            icon={ArrowRight}
          >
            Claim Handle & Launch App
          </PrimaryButton>
        </div>
      </form>
    </AuthLayout>
  );
}
