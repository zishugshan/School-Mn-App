import api from './client'

export const timetableApi = {
  get: (classId: string, sectionId: string) =>
    api.get(`/timetable/class/${classId}/section/${sectionId}`),
  create: (data: Record<string, unknown>) => api.post('/timetable', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/timetable/${id}`, data),
  delete: (id: string) => api.delete(`/timetable/${id}`),
}
