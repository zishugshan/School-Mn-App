import api from './client'

export const chatApi = {
  getConversations: (userId: string) =>
    api.get(`/chat/conversations/${userId}`),

  getMessages: (userId1: string, userId2: string) =>
    api.get(`/chat/conversation/${userId1}/${userId2}`),

  sendMessage: (data: { senderId: number; receiverId: number; content: string }) =>
    api.post('/chat/send', data),

  getUnreadCount: (userId: string) =>
    api.get(`/chat/unread/${userId}/count`),

  searchUsers: (q: string) =>
    api.get(`/chat/users/search?q=${q}`),
}
