import api from './client'
import type { ApiResponse, PageResponse, Teacher } from '@/types'

export const teachersApi = {
  getAll: (params?: Record<string, string>) => api.get<ApiResponse<PageResponse<Teacher>>>('/teachers', { params }),
  getById: (id: string) => api.get<ApiResponse<Teacher>>(`/teachers/${id}`),
  create: (data: Partial<Teacher>) => api.post<ApiResponse<Teacher>>('/teachers', data),
  update: (id: string, data: Partial<Teacher>) => api.put<ApiResponse<Teacher>>(`/teachers/${id}`, data),
  delete: (id: string) => api.delete(`/teachers/${id}`),
}
