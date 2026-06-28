import api from './client'

export const examsApi = {
  getAll: () => api.get('/exams'),
  getById: (id: string) => api.get(`/exams/${id}`),
  create: (data: Record<string, unknown>) => api.post('/exams', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/exams/${id}`, data),
  delete: (id: string) => api.delete(`/exams/${id}`),
  getMySchedule: () => api.get('/exams/my-schedule'),
}
