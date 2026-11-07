import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { InputField, PrimaryButton } from '../components/AuthFormComponents';
import './AuthPages.css';
import api from "../services/api"

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try{
      const response = await api.post("/accounts/register/" ,{
        email: formData.email.trim(),
        password : formData.password,
        confirm_password: formData.confirmPassword,
      });
       navigate("/verify-otp",{
           state : {
            email: response.data.email,
           }
       });
    } catch(error){
      const data = error.response?.data;
      if(data) {
        const messages = Object.entries(data)
        .map(([field , value])=>{
          return `${field}:${
               Array.isArray(value) ? value.join(", ") : value
          }`;
        })
        .join("\n");

        alert(messages);
      }else{
        alert("Cannot connect to the server. Please try again.")
      }
    }finally{
      setIsSubmitting(false);
    };
    // Frontend journey: navigate to OTP verification passing state
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/verify-otp', {
        state: { email: formData.email.trim() }
      });
    }, 400);
  };

  // Password strength visual indicator
  const hasMinLen = formData.password.length >= 8;
  const hasLetterAndNumber = /[a-zA-Z]/.test(formData.password) && /\d/.test(formData.password);

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Chat System to connect and collaborate seamlessly"
    >
      <form onSubmit={handleSubmit} noValidate>
        <InputField
          label="Email Address"
          id="register-email"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          icon={Mail}
          autoComplete="email"
          required
        />

        <InputField
          label="Password"
          id="register-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a strong password"
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
          <div className="password-hints">
            <span className={`hint-item ${hasMinLen ? 'valid' : ''}`}>
              <CheckCircle2 size={13} /> Min 8 characters
            </span>
            <span className={`hint-item ${hasLetterAndNumber ? 'valid' : ''}`}>
              <CheckCircle2 size={13} /> Letters & numbers
            </span>
          </div>
        )}

        <InputField
          label="Confirm Password"
          id="register-confirm-password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          icon={ShieldCheck}
          endIcon={showConfirmPassword ? EyeOff : Eye}
          onEndIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
          autoComplete="new-password"
          required
        />

        <div className="form-submit-wrapper">
          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
          >
            Create Account
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
