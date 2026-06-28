import api from './client'
import type { TransportRoute, StudentTransport } from '@/types'

export const transportApi = {
  getRoutes: () => api.get<TransportRoute[]>('/transport/routes'),
  getRouteById: (id: string) => api.get<TransportRoute>(`/transport/routes/${id}`),
  createRoute: (data: Partial<TransportRoute>) => api.post<TransportRoute>('/transport/routes', data),
  updateRoute: (id: string, data: Partial<TransportRoute>) =>
    api.put<TransportRoute>(`/transport/routes/${id}`, data),
  deleteRoute: (id: string) => api.delete(`/transport/routes/${id}`),
  assignStudent: (data: { studentId: string; routeId: string; stopId: string }) =>
    api.post('/transport/assign', data),
  getMyTransport: () => api.get<StudentTransport>('/transport/my'),
  getStudentTransport: (studentId: string) =>
    api.get<StudentTransport>(`/transport/student/${studentId}`),
}
