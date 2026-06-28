import api from './client'
import type { ApiResponse } from '@/types'

export const analyticsApi = {
  getAttendanceTrends: (classId: string, sectionId?: string, year?: number) =>
    api.get<ApiResponse<Record<string, unknown>>>('/analytics/attendance/trends', {
      params: { classId, sectionId, year: year || new Date().getFullYear() },
    }),
  getSubjectPerformance: (classId: string, subjectId: string) =>
    api.get<ApiResponse<Record<string, unknown>>>('/analytics/performance/subject', {
      params: { classId, subjectId },
    }),
  getHomeworkCompletionTrends: (classId: string, year?: number) =>
    api.get<ApiResponse<Record<string, unknown>>>('/analytics/homework/completion', {
      params: { classId, year: year || new Date().getFullYear() },
    }),
  getClassPerformance: (classId: string, year?: number) =>
    api.get<ApiResponse<Record<string, unknown>>>('/analytics/class/performance', {
      params: { classId, year: year || new Date().getFullYear() },
    }),
  getSchoolPerformance: (year?: number) =>
    api.get<ApiResponse<Record<string, unknown>>>('/analytics/school/performance', {
      params: { year: year || new Date().getFullYear() },
    }),
}
