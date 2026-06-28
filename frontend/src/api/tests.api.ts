import api from './client'
import type { ApiResponse } from '@/types'

export interface CreateTestPayload {
  title: string
  description?: string
  subjectId: number
  classId: number
  sectionId?: number | null
  teacherId: number
  maximumMarks: number
  passingMarks?: number | null
  testDate: string
  examType?: string
}

export interface TestItem {
  id: string
  title: string
  description?: string
  subjectName: string
  className: string
  sectionName?: string
  teacherName?: string
  maximumMarks: number
  passingMarks?: number
  testDate: string
  examType?: string
  isPublished: boolean
  createdAt?: string
}

export const testsApi = {
  create: (data: CreateTestPayload) => api.post<ApiResponse<TestItem>>('/tests', data),
  getByTeacher: (teacherId: string) => api.get<ApiResponse<TestItem[]>>(`/tests/teacher/${teacherId}`),
  getByClass: (classId: string) => api.get<ApiResponse<TestItem[]>>(`/tests/class/${classId}`),
  getById: (id: string) => api.get<ApiResponse<TestItem>>(`/tests/${id}`),
  update: (id: string, data: Partial<CreateTestPayload>) => api.put<ApiResponse<TestItem>>(`/tests/${id}`, data),
  delete: (id: string) => api.delete(`/tests/${id}`),
  publish: (testId: string) => api.post(`/tests/${testId}/publish`),
  getMarks: (testId: string) => api.get(`/tests/${testId}/marks`),
  enterMarks: (testId: string, marks: { studentId: string; marksObtained: number; remarks?: string }[]) =>
    api.post(`/tests/${testId}/marks`, { testId, marks }),
  getByStudent: (studentId: string) => api.get(`/tests/student/${studentId}`),
  getLeaderboard: (testId: string) => api.get(`/tests/${testId}/leaderboard`),
}
