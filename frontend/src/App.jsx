import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetOtp from './pages/VerifyResetOtp';
import SetNewPassword from './pages/SetNewPassword';
import SetUsername from './pages/SetUsername';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route points to Registration */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        
        {/* 1. Registration Flow */}
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        
        {/* 2. Authentication Flow */}
        <Route path="/login" element={<Login />} />
        
        {/* 3. Password Recovery Flow (Newly Added DRF Backend Endpoints) */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
        <Route path="/set-password" element={<SetNewPassword />} />
        
        {/* 4. Onboarding & Workspace Flow */}
        <Route path="/set-username" element={<SetUsername />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Fallback wildcard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
