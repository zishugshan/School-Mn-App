import api from './client'

export const schoolsApi = {
  getAll: () => api.get('/schools'),
  getById: (id: string) => api.get(`/schools/${id}`),
  create: (data: Record<string, unknown>) => api.post('/schools', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/schools/${id}`, data),
  delete: (id: string) => api.delete(`/schools/${id}`),
}
