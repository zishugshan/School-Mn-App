import api from './axios'
import type { BulkAttendanceRequest } from '@/types'

export const getAttendanceByClassAndDate = (classId: string, sectionId: string, date: string) =>
  api.get(`/attendance/class/${classId}/section/${sectionId}/date/${date}`)

export const getAttendanceByDateRange = (classId: string, sectionId: string, startDate: string, endDate: string) =>
  api.get(`/attendance/class/${classId}/section/${sectionId}/range`, { params: { startDate, endDate } })

export const markBulkAttendance = (data: BulkAttendanceRequest) =>
  api.post('/attendance/mark/bulk', data)

export const getStudentAttendance = (studentId: string, startDate: string, endDate: string) =>
  api.get(`/attendance/student/${studentId}`, { params: { startDate, endDate } })

export const getAttendanceSummary = (classId: string, sectionId: string, date: string) =>
  api.get(`/attendance/summary/class/${classId}/section/${sectionId}/date/${date}`)

export const getStudentsByClassAndSection = (classId: string, sectionId: string) =>
  api.get(`/students/class/${classId}/section/${sectionId}`)

export const getClasses = () => api.get('/classes')

export const getSectionsByClass = (classId: string) =>
  api.get(`/classes/${classId}/sections`)
