import api from './client'
import type { SchoolEvent } from '@/types'

export const eventsApi = {
  getAll: (params?: Record<string, string>) => api.get<SchoolEvent[]>('/events', { params }),
  getById: (id: string) => api.get<SchoolEvent>(`/events/${id}`),
  create: (data: Partial<SchoolEvent>) => api.post<SchoolEvent>('/events', data),
  update: (id: string, data: Partial<SchoolEvent>) => api.put<SchoolEvent>(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
  register: (id: string) => api.post(`/events/${id}/register`),
  unregister: (id: string) => api.delete(`/events/${id}/register`),
}
