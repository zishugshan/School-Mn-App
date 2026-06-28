import api from './client'
import type { ApiResponse, Notification } from '@/types'

export const getUnreadCount = async (userId: string) => {
  const response = await api.get<ApiResponse<number>>(`/notifications/user/${userId}/unread/count`)
  return response.data
}

export const getUserNotifications = async (userId: string, params: { page: number; size: number }) => {
  const response = await api.get<ApiResponse<{ content: Notification[] }>>(`/notifications/user/${userId}`, { params })
  return response.data
}

export const markAsRead = async (notificationId: string, userId: string) => {
  await api.put(`/notifications/${notificationId}/user/${userId}/read`)
}

export const markAllAsRead = async (userId: string) => {
  await api.put(`/notifications/user/${userId}/read-all`)
}
