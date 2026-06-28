import api from './client'
import type { House } from '@/types'

export const housesApi = {
  getAll: () => api.get<House[]>('/houses'),
  getById: (id: string) => api.get<House>(`/houses/${id}`),
  create: (data: Partial<House>) => api.post<House>('/houses', data),
  update: (id: string, data: Partial<House>) => api.put<House>(`/houses/${id}`, data),
  delete: (id: string) => api.delete(`/houses/${id}`),
  getMembers: (id: string) => api.get(`/houses/${id}/members`),
}
