import api from './client'
import type { Achievement } from '@/types'

export const achievementsApi = {
  getByStudent: (studentId: string) => api.get<Achievement[]>(`/achievements/student/${studentId}`),
  create: (data: Partial<Achievement>) => api.post<Achievement>('/achievements', data),
  delete: (id: string) => api.delete(`/achievements/${id}`),
}
