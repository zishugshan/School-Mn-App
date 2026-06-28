import api from './client'
import type { ApiResponse, Goal } from '@/types'

export interface CreateGoalPayload {
  classId: number
  studentCode?: string
  title: string
  description?: string
  targetValue: number
  unit?: string
  category?: string
}

export interface CreateSelfGoalPayload {
  title: string
  description?: string
  targetValue: number
  unit?: string
  category?: string
  targetDate?: string
}

export const goalsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<Goal[]>>('/goals', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Goal>>(`/goals/${id}`),
  create: (data: CreateGoalPayload) =>
    api.post<ApiResponse<Goal[]>>('/goals', data),
  createSelf: (data: CreateSelfGoalPayload) =>
    api.post<ApiResponse<Goal>>('/goals/self', data),
  getUserGoals: (userId: string) =>
    api.get<ApiResponse<Goal[]>>(`/goals/user/${userId}`),
  getStudentGoals: (studentId: string) =>
    api.get<ApiResponse<Goal[]>>(`/goals/student/${studentId}`),
  update: (id: string, data: Partial<Goal>) =>
    api.put<ApiResponse<Goal>>(`/goals/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/goals/${id}`),
  updateProgress: (id: string, progress: number) =>
    api.put<ApiResponse<Goal>>(`/goals/${id}/progress`, { progress }),
  markComplete: (id: string) =>
    api.put<ApiResponse<Goal>>(`/goals/${id}/complete`),
}
