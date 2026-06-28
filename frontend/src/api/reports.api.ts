import api from './client'

export const reportsApi = {
  generate: (data: {
    type: string
    studentId?: string
    classId?: string
    dateFrom: string
    dateTo: string
    format: 'pdf' | 'excel'
  }) => api.post('/reports/generate', data, { responseType: 'blob' }),
  getGenerated: () => api.get('/reports'),
  download: (id: string) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
}
