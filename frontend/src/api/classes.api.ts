import api from './client'
import type { ApiResponse, Class } from '@/types'

export const classesApi = {
  getAll: (params?: Record<string, string>) => api.get<ApiResponse<Class[]>>('/classes', { params }),
  getById: (id: string) => api.get<ApiResponse<Class>>(`/classes/${id}`),
  create: (data: Partial<Class>) => api.post<ApiResponse<Class>>('/classes', data),
  update: (id: string, data: Partial<Class>) => api.put<ApiResponse<Class>>(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
  assignTeacher: (classId: string, sectionId: string, teacherId: string, isClassTeacher?: boolean) =>
    api.post(`/classes/${classId}/sections/${sectionId}/teachers/${teacherId}${isClassTeacher ? '?isClassTeacher=true' : ''}`),
  assignSubject: (id: string, subjectId: string) =>
    api.post(`/classes/${id}/subjects`, { subjectId }),
  removeSubject: (id: string, subjectId: string) =>
    api.delete(`/classes/${id}/subjects/${subjectId}`),
}
