import api from './client'
import type { Certificate } from '@/types'

export const certificatesApi = {
  getAll: () => api.get<Certificate[]>('/certificates'),
  getById: (id: string) => api.get<Certificate>(`/certificates/${id}`),
  request: (data: { title: string; description: string; type: string }) =>
    api.post<Certificate>('/certificates/request', data),
  download: (id: string) => api.get(`/certificates/${id}/download`, { responseType: 'blob' }),
  issue: (id: string) => api.put(`/certificates/${id}/issue`),
  approve: (id: string) => api.put(`/certificates/${id}/approve`),
  reject: (id: string, reason: string) => api.put(`/certificates/${id}/reject`, { reason }),
}
