import api from './client'
import type { Conversation, ChatMessage } from '@/types'

export const chatApi = {
  getConversations: () => api.get<Conversation[]>('/chat/conversations'),
  getMessages: (conversationId: string) =>
    api.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, content: string) =>
    api.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, { content }),
  createConversation: (participantIds: string[]) =>
    api.post<Conversation>('/chat/conversations', { participantIds }),
  markRead: (conversationId: string) =>
    api.put(`/chat/conversations/${conversationId}/read`),
}
