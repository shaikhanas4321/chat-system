import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Users,
  Settings,
  LogOut,
  Send,
  Plus,
  ArrowLeft,
  Info,
  Paperclip,
  X,
  AlertCircle
} from 'lucide-react';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import { extractErrorMessage } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  // Navigation tab: 'inbox' | 'search' | 'requests' | 'profile' | 'settings'
  const [activeTab, setActiveTab] = useState('inbox');

  // Authenticated user
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Conversations & selected chat
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Messages in selected conversation
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Start new conversation modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState('');
  const [newChatError, setNewChatError] = useState('');
  const [creatingChat, setCreatingChat] = useState(false);

  // UI state for search tab
  const [userSearchInput, setUserSearchInput] = useState('');

  const messagesEndRef = useRef(null);

  // 1. Initial Authentication & User Profile Check
  useEffect(() => {
    async function initUser() {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const profile = await authService.getProfile();
        setCurrentUser(profile);
      } catch {
        localStorage.removeItem('access_token');
        navigate('/login');
      } finally {
        setLoadingUser(false);
      }
    }

    initUser();

    // Listen for auth expiration events dispatched by api interceptor
    const handleAuthExpired = () => {
      navigate('/login', {
        state: { verifiedMessage: 'Your session has expired. Please sign in again.' },
      });
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [navigate]);

  // 2. Fetch Conversations List
  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const list = await chatService.getConversations();
      setConversations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser, fetchConversations]);

  // 3. Fetch Messages when Conversation Selected
  useEffect(() => {
    if (!selectedConversation) {
      return;
    }

    let isMounted = true;
    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const history = await chatService.getMessages(selectedConversation.id);
        if (isMounted) {
          setMessages(Array.isArray(history) ? history : []);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    }

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedConversation]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper: Determine other participant ID
  const getOtherParticipantId = (conv) => {
    if (!conv || !currentUser) return null;
    return conv.user1 === currentUser.id ? conv.user2 : conv.user1;
  };

  // Helper: Format date
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // 4. Send Message Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!composerText.trim() || !selectedConversation || isSending) return;

    const text = composerText.trim();
    setIsSending(true);

    try {
      const savedMessage = await chatService.sendMessage(selectedConversation.id, text);
      setMessages((prev) => [...prev, savedMessage]);
      setComposerText('');
    } catch (err) {
      const errMsg = extractErrorMessage(err, 'Failed to send message. Please try again.');
      alert(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  // 5. Create or Open Conversation with Another User
  const handleStartConversation = async (otherUserId) => {
    if (!otherUserId) return;
    setCreatingChat(true);
    setNewChatError('');

    try {
      const conv = await chatService.createConversation(otherUserId);
      await fetchConversations();
      setMessages([]);
      setSelectedConversation(conv);
      setShowNewChatModal(false);
      setNewChatUserId('');
      setActiveTab('inbox');
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not start conversation with this user ID.');
      setNewChatError(msg);
    } finally {
      setCreatingChat(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login', {
      state: { verifiedMessage: 'You have signed out successfully.' },
    });
  };

  // Filtered conversation list
  const filteredConversations = conversations.filter((conv) => {
    const otherId = getOtherParticipantId(conv);
    if (!searchQuery) return true;
    return String(otherId).includes(searchQuery.trim());
  });

  if (loadingUser) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-secondary)'
      }}>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* ------------------------------------------------------------------
          1. Global Navigation Rail
          ------------------------------------------------------------------ */}
      <nav className="app-rail">
        <div className="rail-top">
          <div className="rail-brand">
            <div className="rail-brand-icon" title="Chat System">
              <MessageSquare size={18} strokeWidth={2.4} />
            </div>
          </div>

          <div className="rail-nav">
            <button
              type="button"
              className={`rail-tab-btn ${activeTab === 'inbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('inbox')}
              title="Conversations"
            >
              <MessageSquare size={18} />
              {conversations.length > 0 && (
                <span className="rail-badge">{conversations.length}</span>
              )}
            </button>

            <button
              type="button"
              className={`rail-tab-btn ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
              title="Find Users"
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              className={`rail-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
              title="Friend Requests"
            >
              <Users size={18} />
            </button>

            <button
              type="button"
              className={`rail-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        <div className="rail-user">
          <button
            type="button"
            className="rail-avatar"
            onClick={() => setActiveTab('profile')}
            title={`Signed in as ${currentUser?.username || currentUser?.email}`}
          >
            {(currentUser?.username || currentUser?.email || 'U')[0].toUpperCase()}
          </button>

          <button
            type="button"
            className="rail-tab-btn"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* ------------------------------------------------------------------
          2. Tab Views: Inbox / Search / Requests / Profile / Settings
          ------------------------------------------------------------------ */}
      {activeTab === 'inbox' && (
        <>
          {/* Conversation List Sidebar */}
          <aside className={`inbox-sidebar ${selectedConversation ? 'mobile-hidden' : ''}`}>
            <div className="sidebar-header">
              <div className="sidebar-title-row">
                <span className="sidebar-heading">Messages</span>
                <span className="sidebar-count-badge">{conversations.length}</span>
              </div>
              <div className="sidebar-actions">
                <button
                  type="button"
                  className="sidebar-icon-btn"
                  onClick={() => setShowNewChatModal(true)}
                  title="New conversation"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="sidebar-search-wrapper">
              <div className="search-input-box">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter by User ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="new-chat-trigger-bar">
              <button
                type="button"
                className="btn-new-chat-action"
                onClick={() => setShowNewChatModal(true)}
              >
                <Plus size={14} /> Start new chat by User ID
              </button>
            </div>

            <div className="conversation-list-viewport">
              {loadingConversations ? (
                <div className="list-empty-state">
                  <p>Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="list-empty-state">
                  <div className="list-empty-icon">
                    <MessageSquare size={28} />
                  </div>
                  <p>
                    {searchQuery ? 'No matching conversations.' : 'No conversations yet.'}
                  </p>
                  {!searchQuery && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                      onClick={() => setShowNewChatModal(true)}
                    >
                      Start your first chat
                    </button>
                  )}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const otherId = getOtherParticipantId(conv);
                  const isSelected = selectedConversation?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      className={`conversation-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setMessages([]);
                        setSelectedConversation(conv);
                      }}
                    >
                      <div className="conversation-avatar-frame">
                        <div className="avatar-disc">
                          #{otherId}
                        </div>
                      </div>
                      <div className="conversation-content-col">
                        <div className="conversation-header-line">
                          <span className="conversation-name">User #{otherId}</span>
                          <span className="conversation-timestamp">
                            {formatTime(conv.created_at)}
                          </span>
                        </div>
                        <div className="conversation-snippet-line">
                          <span className="conversation-preview">
                            Open conversation
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Individual Chat Interface */}
          <main className={`chat-detail-stage ${!selectedConversation ? 'mobile-hidden' : ''}`}>
            {selectedConversation ? (
              <>
                <header className="chat-top-header">
                  <div className="participant-info-row">
                    <button
                      type="button"
                      className="sidebar-icon-btn"
                      onClick={() => setSelectedConversation(null)}
                      title="Back to inbox"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div className="participant-avatar-lg">
                      #{getOtherParticipantId(selectedConversation)}
                    </div>
                    <div className="participant-meta-col">
                      <h2>User #{getOtherParticipantId(selectedConversation)}</h2>
                      <span className="participant-substatus">
                        Conversation #{selectedConversation.id}
                      </span>
                    </div>
                  </div>

                  <div className="chat-header-actions">
                    <button
                      type="button"
                      className="chat-header-btn"
                      onClick={() => fetchConversations()}
                      title="Refresh conversation"
                    >
                      Refresh
                    </button>
                  </div>
                </header>

                <div className="messages-history-viewport">
                  {loadingMessages ? (
                    <div className="stage-empty-view">
                      <p>Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="stage-empty-view">
                      <div className="empty-view-illustration">
                        <MessageSquare size={24} />
                      </div>
                      <h3>No messages yet</h3>
                      <p>
                        Send a message below to start this conversation.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isSent = msg.sender === currentUser.id;
                      return (
                        <div
                          key={msg.id}
                          className={`message-cluster ${isSent ? 'sent' : 'received'}`}
                        >
                          <div className="message-body-bubble">
                            {msg.content}
                          </div>
                          <span className="message-timestamp-meta">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat-composer-section" onSubmit={handleSendMessage}>
                  <div className="composer-box">
                    <button
                      type="button"
                      className="composer-icon-action"
                      title="Attachment (File uploads not supported by backend yet)"
                      onClick={() => alert('File attachments will be available when backend upload support is added.')}
                    >
                      <Paperclip size={16} />
                    </button>

                    <textarea
                      rows={1}
                      placeholder="Write a message..."
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      className="composer-textarea"
                    />

                    <button
                      type="submit"
                      disabled={!composerText.trim() || isSending}
                      className="composer-send-btn"
                      title="Send message"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="stage-empty-view">
                <div className="empty-view-illustration">
                  <MessageSquare size={28} />
                </div>
                <h3>No conversation selected</h3>
                <p>
                  Choose a conversation from the sidebar or start a new chat with another user.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowNewChatModal(true)}
                >
                  <Plus size={15} /> Start new conversation
                </button>
              </div>
            )}
          </main>
        </>
      )}

      {/* ------------------------------------------------------------------
          Tab 2: User Search
          ------------------------------------------------------------------ */}
      {activeTab === 'search' && (
        <main className="standard-page-view">
          <header className="page-title-section">
            <h1>User Search</h1>
            <p>Connect with other registered users on Chat System.</p>
          </header>

          <div className="feature-notice-card">
            <Info size={16} />
            <div>
              <strong>Backend Integration Status:</strong> The backend does not yet provide an open
              user directory endpoint (`/accounts/search/`). You can directly start a conversation
              with any registered user by their <strong>User ID</strong> below.
            </div>
          </div>

          <div className="settings-card">
            <h3 className="settings-card-title">Connect by User ID</h3>
            <p className="settings-card-desc">
              Directly triggers the backend's `POST /chat/conversations/` endpoint.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
              <input
                type="number"
                placeholder="Enter User ID (e.g. 11)"
                value={userSearchInput}
                onChange={(e) => setUserSearchInput(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleStartConversation(userSearchInput)}
                disabled={!userSearchInput.trim() || creatingChat}
              >
                {creatingChat ? 'Opening...' : 'Start Chat'}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------------
          Tab 3: Friend Requests
          ------------------------------------------------------------------ */}
      {activeTab === 'requests' && (
        <main className="standard-page-view">
          <header className="page-title-section">
            <h1>Friend Requests</h1>
            <p>Review incoming connections and pending invitations.</p>
          </header>

          <div className="feature-notice-card">
            <Info size={16} />
            <div>
              <strong>Feature Preview:</strong> The backend currently uses a direct conversation model
              without a separate friendships database table. When friendships endpoints are introduced,
              incoming and outgoing requests will be manageable here.
            </div>
          </div>

          <div className="settings-card">
            <h3 className="settings-card-title">Incoming Requests (0)</h3>
            <p className="settings-card-desc">No incoming invitations at this time.</p>
          </div>

          <div className="settings-card">
            <h3 className="settings-card-title">Outgoing Requests (0)</h3>
            <p className="settings-card-desc">You have no pending sent requests.</p>
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------------
          Tab 4: User Profile
          ------------------------------------------------------------------ */}
      {activeTab === 'profile' && (
        <main className="standard-page-view">
          <header className="page-title-section">
            <h1>User Profile</h1>
            <p>Your verified account credentials and identity.</p>
          </header>

          <div className="settings-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-light)',
                border: '1.5px solid var(--accent-border)',
                color: 'var(--accent-primary)',
                fontSize: '1.3rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {(currentUser?.username || currentUser?.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
                  {currentUser?.username ? `@${currentUser.username}` : 'No username set'}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  User ID: #{currentUser?.id}
                </span>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-label-col">
                <span className="settings-field-name">Email address</span>
                <span className="settings-field-value">Primary communication address</span>
              </div>
              <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{currentUser?.email}</span>
            </div>

            <div className="settings-row">
              <div className="settings-label-col">
                <span className="settings-field-name">Username</span>
                <span className="settings-field-value">Public identifier</span>
              </div>
              <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                {currentUser?.username ? `@${currentUser.username}` : 'Not set'}
              </span>
            </div>

            <div className="settings-row">
              <div className="settings-label-col">
                <span className="settings-field-name">Account ID</span>
                <span className="settings-field-value">Database reference number</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                #{currentUser?.id}
              </span>
            </div>
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------------
          Tab 5: Settings
          ------------------------------------------------------------------ */}
      {activeTab === 'settings' && (
        <main className="standard-page-view">
          <header className="page-title-section">
            <h1>Settings & Preferences</h1>
            <p>Customize your workspace experience and security.</p>
          </header>

          <div className="settings-card">
            <h3 className="settings-card-title">Security & Credentials</h3>
            <p className="settings-card-desc">Manage authentication and password reset recovery options.</p>

            <div className="settings-row">
              <div className="settings-label-col">
                <span className="settings-field-name">Password Reset</span>
                <span className="settings-field-value">Email OTP recovery flow</span>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/forgot-password')}
              >
                Change password
              </button>
            </div>
          </div>

          <div className="settings-card">
            <h3 className="settings-card-title">Appearance</h3>
            <p className="settings-card-desc">Interface theme and visual preferences.</p>

            <div className="settings-row">
              <div className="settings-label-col">
                <span className="settings-field-name">Active Theme</span>
                <span className="settings-field-value">Calm Light (Default)</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                System Default
              </span>
            </div>
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------------
          Modal: Start New Conversation
          ------------------------------------------------------------------ */}
      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Start new conversation</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowNewChatModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Enter the User ID of the participant you wish to message. The conversation will be
                created or loaded via `POST /chat/conversations/`.
              </p>

              {newChatError && (
                <div className="status-banner banner-danger" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={15} className="status-banner-icon" />
                  <span>{newChatError}</span>
                </div>
              )}

              <div className="form-field">
                <label className="field-label" htmlFor="new-chat-user-id">
                  Recipient User ID
                </label>
                <input
                  id="new-chat-user-id"
                  type="number"
                  placeholder="e.g. 11"
                  value={newChatUserId}
                  onChange={(e) => setNewChatUserId(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowNewChatModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleStartConversation(newChatUserId)}
                disabled={!newChatUserId.trim() || creatingChat}
              >
                {creatingChat ? 'Opening...' : 'Start conversation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
