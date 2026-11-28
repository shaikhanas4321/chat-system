import api from './api';

export const chatService = {
  /**
   * Create or fetch existing conversation with another user
   * POST /chat/conversations/
   * Payload: { other_user_id: number }
   * Returns: { id: number, user1: number, user2: number }
   */
  async createConversation(otherUserId) {
    const id = parseInt(otherUserId, 10);
    const response = await api.post('/chat/conversations/', {
      other_user_id: id,
    });
    return response.data;
  },

  /**
   * Retrieve conversations for the authenticated user
   * GET /chat/conversations/list/
   * Returns: Array of { id, user1, user2, created_at }
   */
  async getConversations() {
    const response = await api.get('/chat/conversations/list/');
    return response.data;
  },

  /**
   * Send a new message to a conversation
   * POST /chat/messages/
   * Payload: { conversation: number, content: string }
   * Returns: { id, conversation, sender, content, is_read, created_at }
   */
  async sendMessage(conversationId, content) {
    const response = await api.post('/chat/messages/', {
      conversation: parseInt(conversationId, 10),
      content: content.trim(),
    });
    return response.data;
  },

  /**
   * Retrieve message history for a specific conversation
   * GET /chat/conversations/{conversation_id}/messages/
   * Returns: Array of { id, conversation, sender, content, is_read, created_at }
   */
  async getMessages(conversationId) {
    const response = await api.get(`/chat/conversations/${conversationId}/messages/`);
    return response.data;
  },
};
