import api from './client'

export const marksApi = {
  getStudentMarks: (studentId: string) => api.get(`/marks/student/${studentId}`),
  getStudentSummary: (studentId: string) => api.get(`/marks/student/${studentId}/summary`),
  getStudentTrend: (studentId: string) => api.get(`/marks/student/${studentId}/trend`),
}
