import api from './axios'
import type { ApiResponse, StudentDashboard, TeacherDashboard, ParentDashboard } from '../types'

export const getStudentDashboard = async (studentId: number): Promise<ApiResponse<StudentDashboard>> => {
  const response = await api.get<ApiResponse<StudentDashboard>>(`/dashboard/student/${studentId}`)
  return response.data
}

export const getTeacherDashboard = async (teacherId: number): Promise<ApiResponse<TeacherDashboard>> => {
  const response = await api.get<ApiResponse<TeacherDashboard>>(`/dashboard/teacher/${teacherId}`)
  return response.data
}

export const getParentDashboard = async (parentId: number): Promise<ApiResponse<ParentDashboard>> => {
  const response = await api.get<ApiResponse<ParentDashboard>>(`/dashboard/parent/${parentId}`)
  return response.data
}
