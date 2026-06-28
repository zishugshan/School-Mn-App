import api from './client'
import type { ApiResponse, Subject } from '@/types'

export const subjectsApi = {
  getAll: () => api.get<ApiResponse<Subject[]>>('/subjects'),
  getById: (id: string) => api.get<ApiResponse<Subject>>(`/subjects/${id}`),
  create: (data: Partial<Subject>) => api.post<ApiResponse<Subject>>('/subjects', data),
  update: (id: string, data: Partial<Subject>) => api.put<ApiResponse<Subject>>(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`),
}
