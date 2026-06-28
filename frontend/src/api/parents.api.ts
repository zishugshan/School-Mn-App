import api from './client'
import type { ApiResponse, Parent } from '@/types'

export const parentsApi = {
  getAll: (params?: Record<string, string>) => api.get<ApiResponse<Parent[]>>('/parents', { params }),
  getById: (id: string) => api.get<ApiResponse<Parent>>(`/parents/${id}`),
  getByStudentId: (studentId: string) => api.get(`/parents/student/${studentId}`),
  create: (data: Partial<Parent>) => api.post<ApiResponse<Parent>>('/parents', data),
  update: (id: string, data: Partial<Parent>) => api.put<ApiResponse<Parent>>(`/parents/${id}`, data),
  delete: (id: string) => api.delete(`/parents/${id}`),
  linkStudent: (parentId: string, studentId: string) =>
    api.post(`/parents/${parentId}/students`, { studentId }),
  unlinkStudent: (parentId: string, studentId: string) =>
    api.delete(`/parents/${parentId}/students/${studentId}`),
}
