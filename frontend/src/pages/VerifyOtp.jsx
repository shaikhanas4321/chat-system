import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2, RotateCcw, ArrowLeft, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { PrimaryButton } from '../components/AuthFormComponents';
import { authService, extractErrorMessage } from '../services/authService';
import './AuthPages.css';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 min
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendStatus, setResendStatus] = useState({ loading: false, message: '', error: '' });

  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

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
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    if (!email) {
      setError('No registration session detected. Please return to the registration page.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await authService.verifyOtp({
        email,
        otp: code,
      });

      navigate('/login', {
        state: {
          verifiedMessage: 'Email verified successfully! Please sign in with your credentials.',
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
        password: 'dummy_for_resend_trigger',
      });
      setResendCooldown(60);
      setTimeLeft(300);
      setResendStatus({ loading: false, message: 'A new code has been sent.', error: '' });
      setTimeout(() => setResendStatus((s) => ({ ...s, message: '' })), 4000);
    } catch {
      setResendStatus({
        loading: false,
        message: '',
        error: 'To request a new code, please return to registration and resubmit.',
      });
    }
  };

  const isExpired = timeLeft <= 0;

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit verification code sent to your email"
    >
      <div className="otp-container">
        <div className="recipient-pill">
          <div className="recipient-pill-icon">
            <Mail size={15} />
          </div>
          <div className="recipient-pill-details">
            <span className="recipient-pill-label">Verification sent to</span>
            <span className="recipient-pill-value">{email || 'No email specified'}</span>
          </div>
        </div>

        {error && (
          <div className="status-banner banner-danger" role="alert">
            <AlertCircle size={16} className="status-banner-icon" />
            <span>{error}</span>
          </div>
        )}

        {isExpired && !error && (
          <div className="status-banner banner-danger">
            <Clock size={16} className="status-banner-icon" />
            <span>Verification code expired. Please request a new code.</span>
          </div>
        )}

        {resendStatus.message && (
          <div className="status-banner banner-success">
            <CheckCircle2 size={16} className="status-banner-icon" />
            <span>{resendStatus.message}</span>
          </div>
        )}

        {resendStatus.error && (
          <div className="status-banner banner-info">
            <AlertCircle size={16} className="status-banner-icon" />
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
              Verify email
            </PrimaryButton>
          </div>
        </form>

        <div className="otp-timer-row">
          <div className="otp-countdown">
            <span>Code expires in:</span>
            <span className="otp-countdown-mono">{formatTimer(timeLeft)}</span>
          </div>

          <div>
            {resendCooldown > 0 ? (
              <span className="otp-countdown-mono" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                className="btn-inline-resend"
                onClick={handleResend}
                disabled={resendStatus.loading}
              >
                <RotateCcw size={13} /> Resend code
              </button>
            )}
          </div>
        </div>

        <div className="otp-back-row">
          <Link to="/register" className="btn-back-link">
            <ArrowLeft size={13} /> Back to registration
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
