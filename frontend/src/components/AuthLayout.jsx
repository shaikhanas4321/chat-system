import React from 'react';
import { MessageSquare } from 'lucide-react';
import './AuthLayout.css';

const CURRENT_YEAR = 2026;

export default function AuthLayout({
  children,
  title,
  subtitle,
}) {
  return (
    <div className="auth-container">
      <main className="auth-card-wrapper">
        <div className="auth-brand-badge">
          <div className="auth-brand-icon">
            <MessageSquare size={17} strokeWidth={2.4} />
          </div>
          <span className="auth-brand-name">Chat System</span>
        </div>

        <header className="auth-header">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </header>

        <section className="auth-card-body">
          {children}
        </section>
      </main>

      <footer className="auth-footer">
        <p>&copy; {CURRENT_YEAR} Chat System. Modern, approachable messaging.</p>
      </footer>
    </div>
  );
}
