import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route points to Registration as requested by flow */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        
        {/* 1. Registration Page */}
        <Route path="/register" element={<Register />} />
        
        {/* 2. OTP Verification Page */}
        <Route path="/verify-otp" element={<VerifyOtp />} />
        
        {/* 3. Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Fallback wildcard */}
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
