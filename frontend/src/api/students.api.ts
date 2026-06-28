import api from './client'
import type { ApiResponse, PageResponse, Student } from '@/types'

export const studentsApi = {
  getAll: (params?: Record<string, string>) => api.get<ApiResponse<PageResponse<Student>>>('/students', { params }),
  getById: (id: string) => api.get<ApiResponse<Student>>(`/students/${id}`),
  create: (data: Partial<Student>) => api.post<ApiResponse<Student>>('/students', data),
  update: (id: string, data: Partial<Student>) => api.put<ApiResponse<Student>>(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
  getByClass: (classId: string) =>
    api.get(`/students/class/${classId}`),
  getByClassAndSection: (classId: string, sectionId: string) =>
    api.get(`/students/class/${classId}/section/${sectionId}`),
}
