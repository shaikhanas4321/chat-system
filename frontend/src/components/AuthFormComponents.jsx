import React from 'react';
import './AuthForm.css';

export function InputField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon: Icon,
  endIcon: EndIcon,
  onEndIconClick,
  disabled = false,
  required = false,
  autoComplete,
  rightAction,
  autoFocus = false
}) {
  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      {(label || rightAction) && (
        <div className="field-label-row">
          {label ? (
            <label htmlFor={id} className="field-label">
              {label} {required && <span className="field-required">*</span>}
            </label>
          ) : <span />}
          {rightAction && <div className="field-right-action">{rightAction}</div>}
        </div>
      )}
      <div className="input-box-wrapper">
        {Icon && (
          <span className="field-icon-start">
            <Icon size={16} />
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={`form-input ${Icon ? 'with-start-icon' : ''} ${EndIcon ? 'with-end-icon' : ''}`}
        />
        {EndIcon && (
          <button
            type="button"
            className="field-icon-btn"
            onClick={onEndIconClick}
            tabIndex={-1}
            aria-label="Toggle input visibility"
          >
            <EndIcon size={16} />
          </button>
        )}
      </div>
      {error && <span className="field-error-message">{error}</span>}
      {!error && helperText && <span className="field-helper">{helperText}</span>}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = 'submit',
  isLoading = false,
  disabled = false,
  fullWidth = true,
  icon: Icon
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`btn-primary ${fullWidth ? 'btn-full' : ''}`}
    >
      {isLoading ? (
        <>
          <span className="btn-spinner" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {children}
          {Icon && <Icon size={16} />}
        </>
      )}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  icon: Icon
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-secondary ${fullWidth ? 'btn-full' : ''}`}
    >
      {Icon && <Icon size={15} />}
      <span>{children}</span>
    </button>
  );
}

export function GoogleButton({ onClick, label = "Continue with Google" }) {
  return (
    <button
      type="button"
      className="btn-google"
      onClick={onClick}
    >
      <svg className="google-icon" viewBox="0 0 24 24" width="17" height="17">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
}
