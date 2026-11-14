import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquareCode, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  Hash, 
  Send, 
  Users, 
  Search,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { authService } from '../services/authService';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState('general');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'System Bot',
      handle: 'bot',
      content: 'Welcome to Chat System! Your connection is end-to-end encrypted.',
      time: 'Just now',
      isSystem: true,
    },
    {
      id: 2,
      sender: 'Core Protocol',
      handle: 'network',
      content: 'Hardware-accelerated WebSocket node synchronized.',
      time: 'Just now',
      isSystem: true,
    }
  ]);

  const welcomeMessage = location.state?.welcomeMessage;

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch {
        // If not authenticated or token expired, redirect to login
        navigate('/login');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [navigate]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: profile?.username || profile?.email?.split('@')[0] || 'You',
      handle: profile?.username || 'me',
      content: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessageInput('');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login', {
      state: { verifiedMessage: 'You have been safely signed out of your session.' },
    });
  };

  if (loading) {
    return (
      <div className="dash-loading-screen">
        <div className="dash-spinner" />
        <p>Establishing encrypted session...</p>
      </div>
    );
  }

  return (
    <div className="dash-root">
      {/* Top App Bar */}
      <header className="dash-topbar">
        <div className="dash-brand">
          <div className="brand-gem">
            <MessageSquareCode size={19} />
          </div>
          <span className="dash-brand-title">Chat System</span>
          <span className="dash-status-badge">Protected</span>
        </div>

        <div className="dash-search-box">
          <Search size={15} className="dash-search-icon" />
          <input
            type="text"
            placeholder="Search channels, messages, or peers..."
            className="dash-search-input"
          />
        </div>

        <div className="dash-user-bar">
          <div className="dash-user-badge">
            <div className="dash-avatar-circle">
              {(profile?.username || profile?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="dash-user-info">
              <span className="dash-username">
                {profile?.username ? `@${profile.username}` : profile?.email}
              </span>
              <span className="dash-email">{profile?.email}</span>
            </div>
          </div>

          <button
            type="button"
            className="dash-logout-btn"
            onClick={handleLogout}
            title="Terminate session and sign out"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <div className="dash-workspace">
        {/* Sidebar Channels & Peers */}
        <aside className="dash-sidebar">
          <div className="dash-sidebar-section">
            <div className="sidebar-section-header">
              <span>Secure Channels</span>
            </div>
            <nav className="channel-list">
              <button
                type="button"
                className={`channel-item ${activeChannel === 'general' ? 'active' : ''}`}
                onClick={() => setActiveChannel('general')}
              >
                <Hash size={16} />
                <span>general</span>
              </button>
              <button
                type="button"
                className={`channel-item ${activeChannel === 'engineering' ? 'active' : ''}`}
                onClick={() => setActiveChannel('engineering')}
              >
                <Hash size={16} />
                <span>engineering</span>
              </button>
              <button
                type="button"
                className={`channel-item ${activeChannel === 'security-ops' ? 'active' : ''}`}
                onClick={() => setActiveChannel('security-ops')}
              >
                <Lock size={15} />
                <span>security-ops</span>
              </button>
            </nav>
          </div>

          <div className="dash-sidebar-section">
            <div className="sidebar-section-header">
              <span>Security & Identity</span>
            </div>
            <div className="security-telemetry-card">
              <div className="telemetry-row">
                <ShieldCheck size={14} className="telemetry-icon" />
                <span>TLS 1.3 / AES-256-GCM</span>
              </div>
              <div className="telemetry-row">
                <Sparkles size={14} className="telemetry-icon" />
                <span>OTP Protection Active</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Conversation View */}
        <main className="dash-chat-stage">
          {welcomeMessage && (
            <div className="dash-welcome-banner">
              <CheckCircle2 size={16} />
              <span>{welcomeMessage}</span>
            </div>
          )}

          <div className="channel-header-bar">
            <div className="channel-meta">
              <Hash size={20} className="channel-hash-icon" />
              <div>
                <h2>{activeChannel}</h2>
                <span className="channel-subtext">Encrypted mesh channel</span>
              </div>
            </div>
            <div className="channel-peers-count">
              <Users size={14} />
              <span>1 peer online</span>
            </div>
          </div>

          {/* Messages feed */}
          <div className="messages-viewport">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`message-bubble ${m.isSelf ? 'message-self' : ''} ${
                  m.isSystem ? 'message-system' : ''
                }`}
              >
                <div className="msg-header">
                  <span className="msg-sender">{m.sender}</span>
                  <span className="msg-time">{m.time}</span>
                </div>
                <div className="msg-body">{m.content}</div>
              </div>
            ))}
          </div>

          {/* Interactive Composer */}
          <form className="message-composer" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder={`Send message to #${activeChannel}...`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="composer-input"
            />
            <button
              type="submit"
              className="composer-send-btn"
              disabled={!messageInput.trim()}
              title="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
