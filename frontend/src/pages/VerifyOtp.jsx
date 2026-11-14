import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2, RotateCcw, ArrowLeft, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { PrimaryButton } from '../components/AuthFormComponents';
import { authService, extractErrorMessage } from '../services/authService';
import './AuthPages.css';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve email forwarded from registration
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 min expiry window
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendStatus, setResendStatus] = useState({ loading: false, message: '', error: '' });

  const inputRefs = useRef([]);

  // Auto-focus first input box
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // 5-minute expiry timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
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

    // Advance focus
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
    const code = otp.join('');

    if (code.length < 6) {
      setError('Please enter all 6 numeric digits of your code.');
      return;
    }

    if (!email) {
      setError('No registration session detected. Please return to the sign-up page.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await authService.verifyOtp({
        email,
        otp: code,
      });

      // Verification succeeded -> navigate to login with confirmation
      navigate('/login', {
        state: {
          verifiedMessage: 'Email successfully verified! Your account is active. Please sign in.',
          prefillEmail: email,
        },
      });
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        'Invalid or expired verification code. Please request a new one.'
      );
      setError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    setResendStatus({ loading: true, message: '', error: '' });

    try {
      // Re-trigger registration OTP flow
      await authService.register({
        email,
        password: 'dummy_for_resend_trigger', // Will be rejected or user can re-enter
      }).catch(async (e) => {
        // If register complains user email exists or password missing:
        throw e;
      });
      setResendCooldown(60);
      setTimeLeft(300);
      setResendStatus({ loading: false, message: 'A new code has been dispatched.', error: '' });
      setTimeout(() => setResendStatus((s) => ({ ...s, message: '' })), 4000);
    } catch {
      // If endpoint requires re-registering
      setResendStatus({
        loading: false,
        message: '',
        error: 'To resend a fresh code, please re-submit the registration form.',
      });
    }
  };

  const isExpired = timeLeft <= 0;

  return (
    <AuthLayout
      title="Verify your inbox"
      subtitle="Enter the 6-digit cryptographic verification code sent to your email"
      stepText="Step 02 / Verification"
      showcaseHighlight="Zero-knowledge confirmation. Verification tokens expire after 5 minutes."
    >
      <div className="otp-container">
        {/* Recipient Details */}
        <div className="recipient-pill">
          <div className="recipient-pill-icon">
            <Mail size={16} />
          </div>
          <div className="recipient-pill-details">
            <span className="recipient-pill-label">Authorized Recipient</span>
            <span className="recipient-pill-value">{email || 'No email specified'}</span>
          </div>
        </div>

        {error && (
          <div className="status-banner banner-danger" role="alert">
            <AlertCircle size={17} className="status-banner-icon" />
            <span>{error}</span>
          </div>
        )}

        {isExpired && !error && (
          <div className="status-banner banner-danger">
            <ShieldAlert size={17} className="status-banner-icon" />
            <span>Verification code expired. Please request a fresh OTP or re-register.</span>
          </div>
        )}

        {resendStatus.message && (
          <div className="status-banner banner-success">
            <CheckCircle2 size={17} className="status-banner-icon" />
            <span>{resendStatus.message}</span>
          </div>
        )}

        {resendStatus.error && (
          <div className="status-banner banner-info">
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
              Verify & Complete Sign Up
            </PrimaryButton>
          </div>
        </form>

        <div className="otp-timer-row">
          <div className="otp-countdown">
            <span>Code validity:</span>
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
          <Link to="/register" className="btn-back-link">
            <ArrowLeft size={14} /> Back to Registration
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
