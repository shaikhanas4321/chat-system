import React from 'react';
import { MessageSquareText } from 'lucide-react';
import './AuthLayout.css';

export default function AuthLayout({
  children,
  title,
  subtitle,
  badgeText = "Chat System"
}) {
  return (
    <div className="auth-container">
      {/* Dynamic Background Elements */}
      <div className="glow-sphere glow-sphere-1" />
      <div className="glow-sphere glow-sphere-2" />
      <div className="bg-grid-overlay" />

      <main className="auth-card-wrapper">
        <header className="auth-header">
          <div className="brand-logo-container">
            <div className="brand-icon-box">
              <MessageSquareText size={26} className="brand-icon" />
            </div>
            <div className="brand-meta">
              <span className="brand-title">{badgeText}</span>
              <span className="brand-badge">Secure v1.0</span>
            </div>
          </div>
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </header>

        <section className="auth-card-body">
          {children}
        </section>
      </main>

      <footer className="auth-footer">
        <p>© {new Date().getFullYear()} Chat System. Modern, end-to-end encrypted messaging.</p>
      </footer>
    </div>
  );
}
