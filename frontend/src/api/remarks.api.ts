import api from './client'
import type { ApiResponse, Remark } from '@/types'

export const remarksApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<Remark[]>>('/remarks', { params }),
  create: (data: Partial<Remark>) =>
    api.post<ApiResponse<Remark>>('/remarks', data),
  getByStudent: (studentId: string) =>
    api.get<ApiResponse<Remark[]>>(`/remarks/student/${studentId}`),
  getByTeacher: (teacherId: string) =>
    api.get<ApiResponse<Remark[]>>(`/remarks/teacher/${teacherId}`),
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/remarks/${id}`),
}
