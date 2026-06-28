import dayjs from 'dayjs'
import { AttendanceStatus, HomeworkStatus } from '../types'
import type {} from '../types'
import {
  ATTENDANCE_STATUS_COLORS,
  HOMEWORK_STATUS_COLORS,
  DATE_FORMAT,
  DATE_TIME_FORMAT,
} from './constants'

export const formatDate = (date: string | Date, format: string = DATE_FORMAT): string => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format(DATE_TIME_FORMAT)
}

export const getStatusColor = (status: AttendanceStatus | HomeworkStatus | string): string => {
  if (status in ATTENDANCE_STATUS_COLORS) {
    return ATTENDANCE_STATUS_COLORS[status as AttendanceStatus]
  }
  if (status in HOMEWORK_STATUS_COLORS) {
    return HOMEWORK_STATUS_COLORS[status as HomeworkStatus]
  }
  return '#757575'
}

export const getInitials = (firstName: string, lastName?: string): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return `${first}${last}`
}

export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`
}

export const calculatePercentage = (obtained: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((obtained / total) * 100)
}

export const getGradeFromPercentage = (percentage: number): string => {
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B+'
  if (percentage >= 60) return 'B'
  if (percentage >= 50) return 'C'
  if (percentage >= 40) return 'D'
  return 'F'
}

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const isAdmin = (role: string): boolean => role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN'
export const isTeacher = (role: string): boolean => role === 'TEACHER'
export const isStudent = (role: string): boolean => role === 'STUDENT'
export const isParent = (role: string): boolean => role === 'PARENT'
