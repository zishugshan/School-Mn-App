import type { UserRole, AttendanceStatus, HomeworkStatus } from '../types'

export const ROLES: UserRole[] = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']

export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE']

export const HOMEWORK_STATUSES: HomeworkStatus[] = ['pending', 'submitted', 'graded', 'overdue']

export const TEST_TYPES = ['unit_test', 'midterm', 'final', 'quiz', 'assignment'] as const

export const GENDERS = ['male', 'female'] as const

export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: '#4caf50',
  ABSENT: '#f44336',
  LATE: '#ff9800',
  HALF_DAY: '#2196f3',
  LEAVE: '#9e9e9e',
}

export const HOMEWORK_STATUS_COLORS: Record<HomeworkStatus, string> = {
  pending: '#ff9800',
  submitted: '#2196f3',
  graded: '#4caf50',
  overdue: '#f44336',
}

export const NAVIGATION_WIDTH = 260
export const COLLAPSED_NAV_WIDTH = 64

export const ITEMS_PER_PAGE = 10

export const PAGE_SIZES = [5, 10, 25, 50]

export const DATE_FORMAT = 'DD/MM/YYYY'
export const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm'
