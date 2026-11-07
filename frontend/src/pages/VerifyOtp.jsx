import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2, RotateCcw, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { PrimaryButton } from '../components/AuthFormComponents';
import './AuthPages.css';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve email forwarded from registration or state fallback
  const email = location.state?.email || 'your email';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(45);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef([]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Autofocus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only accept numbers
    const cleanValue = value.replace(/[^0-9]/g, '');

    if (!cleanValue) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    // Handle single digit input
    const char = cleanValue.slice(-1);
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
    const pastedData = e.clipboardData.getData('text').trim();
    const numbersOnly = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

    if (numbersOnly.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = numbersOnly[i] || '';
      }
      setOtp(newOtp);
      setError('');

      // Focus appropriate index
      const focusIndex = Math.min(numbersOnly.length, 5);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      }
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const fullCode = otp.join('');

    if (fullCode.length < 6) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }

    setIsVerifying(true);

    // Follow journey: after verification, navigate to login
    setTimeout(() => {
      setIsVerifying(false);
      navigate('/login', {
        state: { verifiedMessage: 'Account successfully verified! Please sign in.' }
      });
    }, 450);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(45);
    setResendSuccess(true);
    setTimeout(() => setResendSuccess(false), 3500);
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We sent a 6-digit confirmation code to your inbox"
    >
      <div className="otp-container">
        {/* Recipient banner */}
        <div className="otp-target-card">
          <Mail size={16} className="otp-target-icon" />
          <span className="otp-target-email">{email}</span>
        </div>

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
                className={`otp-digit-box ${digit ? 'is-filled' : ''} ${error ? 'is-error' : ''}`}
                autoComplete="off"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          {error && <div className="otp-error-text">{error}</div>}

          {resendSuccess && (
            <div className="otp-success-alert">
              <CheckCircle2 size={16} /> A fresh code has been sent to your email.
            </div>
          )}

          <div className="form-submit-wrapper">
            <PrimaryButton
              type="submit"
              isLoading={isVerifying}
              disabled={otp.join('').length < 6}
            >
              Verify OTP
            </PrimaryButton>
          </div>
        </form>

        {/* Resend Action */}
        <div className="otp-resend-wrapper">
          <span className="resend-label">Didn't receive code?</span>{' '}
          {resendCooldown > 0 ? (
            <span className="resend-countdown">Resend in {resendCooldown}s</span>
          ) : (
            <button
              type="button"
              className="btn-link-action"
              onClick={handleResend}
            >
              <RotateCcw size={13} /> Resend OTP
            </button>
          )}
        </div>

        {/* Back Link */}
        <div className="otp-back-wrapper">
          <Link to="/register" className="btn-back-link">
            <ArrowLeft size={14} /> Back to Registration
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
