import React from 'react';
import { MessageSquareCode, ShieldCheck, Zap, Lock, Globe } from 'lucide-react';
import './AuthLayout.css';

const CURRENT_YEAR = 2026;

export default function AuthLayout({
  children,
  title,
  subtitle,
  badgeText = "Chat System",
  stepText = null,
  showcaseHighlight = "Engineered for high-throughput, private peer communication."
}) {
  return (
    <div className="auth-page-root">
      <div className="auth-bg-pattern" />

      {/* Architectural Left Showcase (Visible on Desktop) */}
      <aside className="auth-showcase-panel">
        <div className="showcase-top">
          <div className="showcase-brand">
            <div className="brand-gem">
              <MessageSquareCode size={20} />
            </div>
            <span className="brand-name">{badgeText}</span>
            <span className="brand-status-tag">v2.4 Live</span>
          </div>
        </div>

        <div className="showcase-narrative">
          <div className="narrative-tag">
            <Zap size={14} />
            <span>Next-Generation Protocol</span>
          </div>
          <h2 className="narrative-headline">
            Conversations designed with <em>integrity</em> and precision.
          </h2>
          <p className="narrative-subtext">
            {showcaseHighlight}
          </p>

          <div className="showcase-features">
            <div className="feature-item">
              <div className="feature-icon-box">
                <Lock size={15} />
              </div>
              <div className="feature-content">
                <h4>End-to-End Cryptographic Handshakes</h4>
                <p>Granular session keys verified with secure ephemeral credentials.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box">
                <ShieldCheck size={15} />
              </div>
              <div className="feature-content">
                <h4>Multi-Factor OTP Guard</h4>
                <p>Time-bound, single-use authentication codes safeguard every access request.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box">
                <Globe size={15} />
              </div>
              <div className="feature-content">
                <h4>Sub-Millisecond Realtime Relay</h4>
                <p>Distributed WebSocket mesh delivering messages instantly without lag.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="showcase-footer">
          <span>&copy; {CURRENT_YEAR} Chat System Inc.</span>
          <span>Security Protocol 802.1AE Compliant</span>
        </div>
      </aside>

      {/* Main Interactive Stage */}
      <main className="auth-stage-panel">
        <div className="auth-form-card">
          {/* Mobile brand header */}
          <div className="mobile-brand-header">
            <div className="brand-gem">
              <MessageSquareCode size={18} />
            </div>
            <span className="brand-name">{badgeText}</span>
            <span className="brand-status-tag">Live</span>
          </div>

          <header className="card-header">
            {stepText && (
              <div className="card-badge-row">
                <span className="step-indicator">{stepText}</span>
              </div>
            )}
            <h1 className="card-title">{title}</h1>
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </header>

          <div className="card-body">
            {children}
          </div>

          <footer className="card-footer-caption">
            Protected by automated anomaly detection & encrypted tokens.
          </footer>
        </div>
      </main>
    </div>
  );
}
