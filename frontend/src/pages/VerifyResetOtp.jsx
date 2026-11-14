import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, User, RotateCcw, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { PrimaryButton } from '../components/AuthFormComponents';
import { authService, extractErrorMessage } from '../services/authService';
import './AuthPages.css';

export default function VerifyResetOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve username and email passed from forgot password screen
  const username = location.state?.username || '';
  const email = location.state?.email || '';
  const initialMessage = location.state?.message || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (matches backend cache timeout)
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendStatus, setResendStatus] = useState({ loading: false, message: '', error: '' });

  const inputRefs = useRef([]);

  // Auto-focus first input box
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // 5-minute expiry countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleChange = (index, value) => {
    const clean = value.replace(/[^0-9]/g, '');

    if (!clean) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const char = clean.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    setError('');

    // Advance focus to next digit box
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    const digitsOnly = pasted.replace(/[^0-9]/g, '').slice(0, 6);

    if (digitsOnly.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digitsOnly[i] || '';
      }
      setOtp(newOtp);
      setError('');

      const focusIdx = Math.min(digitsOnly.length, 5);
      if (inputRefs.current[focusIdx]) {
        inputRefs.current[focusIdx].focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullCode = otp.join('');

    if (fullCode.length < 6) {
      setError('Please provide all 6 digits of the recovery code.');
      return;
    }

    if (!username) {
      setError('Username context missing. Please return to the password recovery screen.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await authService.verifyForgotPasswordOtp({
        username,
        otp: fullCode,
      });

      // Backend returns { message: "otp has matched", reset: "token" } or reset_token
      const resetToken = response.reset || response.reset_token;

      if (!resetToken) {
        throw new Error('Failed to retrieve reset authorization token from server.');
      }

      // Navigate to Set New Password page passing reset_token securely through location state
      navigate('/set-password', {
        state: {
          reset_token: resetToken,
          username,
        },
      });
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        'Invalid or expired recovery code. Please double-check the digits or request a fresh code.'
      );
      setError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !username) return;

    setResendStatus({ loading: true, message: '', error: '' });
    setError('');

    try {
      const response = await authService.forgotPassword({ username });
      setResendCooldown(60);
      setTimeLeft(300);
      setResendStatus({
        loading: false,
        message: response?.message || 'A fresh verification code has been dispatched to your email.',
        error: '',
      });
      setTimeout(() => setResendStatus((s) => ({ ...s, message: '' })), 4000);
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not resend OTP. Please try again.');
      setResendStatus({ loading: false, message: '', error: msg });
    }
  };

  const isExpired = timeLeft <= 0;

  return (
    <AuthLayout
      title="Verify recovery code"
      subtitle="Enter the 6-digit confirmation code dispatched to your registered email"
      stepText="Step 02 / Token Authentication"
      showcaseHighlight="Multi-factor challenge validates rightful ownership of the account before password mutation."
    >
      <div className="otp-container">
        {/* Recipient Details Pill */}
        <div className="recipient-pill">
          <div className="recipient-pill-icon">
            <User size={16} />
          </div>
          <div className="recipient-pill-details">
            <span className="recipient-pill-label">Account Subject</span>
            <span className="recipient-pill-value">
              @{username || 'unknown'} {email ? `(${email})` : ''}
            </span>
          </div>
        </div>

        {initialMessage && !error && !resendStatus.message && (
          <div className="status-banner banner-info">
            <Mail size={16} className="status-banner-icon" />
            <span>{initialMessage}</span>
          </div>
        )}

        {error && (
          <div className="status-banner banner-danger" role="alert">
            <AlertCircle size={17} className="status-banner-icon" />
            <span>{error}</span>
          </div>
        )}

        {isExpired && !error && (
          <div className="status-banner banner-danger">
            <Clock size={17} className="status-banner-icon" />
            <span>Code has expired after 5 minutes. Please click 'Resend OTP' below.</span>
          </div>
        )}

        {resendStatus.message && (
          <div className="status-banner banner-success">
            <CheckCircle2 size={17} className="status-banner-icon" />
            <span>{resendStatus.message}</span>
          </div>
        )}

        {resendStatus.error && (
          <div className="status-banner banner-danger">
            <AlertCircle size={17} className="status-banner-icon" />
            <span>{resendStatus.error}</span>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="otp-inputs-grid" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isVerifying}
                className={`otp-digit-box ${digit ? 'is-filled' : ''} ${error ? 'is-error' : ''}`}
                autoComplete="off"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          <div className="form-submit-wrapper">
            <PrimaryButton
              type="submit"
              isLoading={isVerifying}
              disabled={otp.join('').length < 6 || isVerifying}
              icon={ArrowRight}
            >
              Verify Code & Proceed
            </PrimaryButton>
          </div>
        </form>

        <div className="otp-timer-row">
          <div className="otp-countdown">
            <span>Code expiry:</span>
            <span className="otp-countdown-mono">{formatTimer(timeLeft)}</span>
          </div>

          <div>
            {resendCooldown > 0 ? (
              <span className="otp-countdown-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                className="btn-inline-resend"
                onClick={handleResend}
                disabled={resendStatus.loading}
              >
                <RotateCcw size={13} /> Resend OTP
              </button>
            )}
          </div>
        </div>

        <div className="otp-back-row">
          <Link to="/forgot-password" className="btn-back-link">
            <ArrowLeft size={14} /> Back to Username Input
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
