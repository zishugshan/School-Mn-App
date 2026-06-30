import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import type { UserRole } from './types'
import AppLayout from './components/layout/AppLayout'
import LoadingSpinner from './components/common/LoadingSpinner'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import StudentRoutes from './pages/students/StudentRoutes'
import TeacherRoutes from './pages/teachers/TeacherRoutes'
import ParentRoutes from './pages/parents/ParentRoutes'
import ClassRoutes from './pages/classes/ClassRoutes'
import SubjectRoutes from './pages/subjects/SubjectRoutes'
import AttendanceRoutes from './pages/attendance/AttendanceRoutes'
import StudentAttendancePage from './pages/attendance/StudentAttendancePage'
import StudentMarksPage from './pages/marks/StudentMarksPage'
import StudentHomeworkPage from './pages/homework/StudentHomeworkPage'
import HomeworkRoutes from './pages/homework/HomeworkRoutes'
import TestRoutes from './pages/tests/TestRoutes'
import MarksRoutes from './pages/marks/MarksRoutes'
import LeaderboardRoutes from './pages/leaderboards/LeaderboardRoutes'
import ReportRoutes from './pages/reports/ReportRoutes'
import EventRoutes from './pages/events/EventRoutes'
import LibraryRoutes from './pages/library/LibraryRoutes'
import TransportRoutes from './pages/transport/TransportRoutes'
import NotificationsPage from './pages/notifications/NotificationsPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import CalendarPage from './pages/calendar/CalendarPage'
import ChatPage from './pages/chat/ChatPage'
import RemarksPage from './pages/remarks/RemarksPage'
import GoalsPage from './pages/goals/GoalsPage'
import CertificatesPage from './pages/certificates/CertificatesPage'
import FeesPage from './pages/fees/FeesPage'
import TimetablePage from './pages/timetable/TimetablePage'
import ExamSchedulePage from './pages/exams/ExamSchedulePage'
import HousesPage from './pages/houses/HousesPage'
import SettingsPage from './pages/settings/SettingsPage'
import ProfilePage from './pages/profile/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import AdminDashboard from './pages/dashboard/admin/AdminDashboard'
import TeacherDashboard from './pages/dashboard/teacher/TeacherDashboard'
import StudentDashboard from './pages/dashboard/student/StudentDashboard'
import ParentDashboard from './pages/dashboard/parent/ParentDashboard'
import LandingPage from './pages/landing/LandingPage'
import SchoolsPage from './pages/superadmin/SchoolsPage'
import InquiriesPage from './pages/superadmin/InquiriesPage'
import ImportPage from './pages/superadmin/ImportPage'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const BlockStudent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  if (user?.role === 'STUDENT') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  if (!user) return <LoadingSpinner />
  switch (user.role) {
    case 'SUPER_ADMIN':
    case 'SCHOOL_ADMIN':
      return <AdminDashboard />
    case 'TEACHER':
      return <TeacherDashboard />
    case 'STUDENT':
      return <StudentDashboard />
    case 'PARENT':
      return <ParentDashboard />
    default:
      return <AdminDashboard />
  }
}

const getDashboardPath = (_role: UserRole): string => {
  return '/dashboard'
}

const App: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={getDashboardPath(user!.role)} replace />
          ) : (
            <LandingPage />
          )
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/students/*" element={<StudentRoutes />} />
        <Route path="/teachers/*" element={<TeacherRoutes />} />
        <Route path="/parents/*" element={<ParentRoutes />} />
        <Route path="/classes/*" element={<ClassRoutes />} />
        <Route path="/subjects/*" element={<SubjectRoutes />} />
        <Route path="/attendance/*" element={<AttendanceRoutes />} />
        <Route path="/my-attendance" element={<StudentAttendancePage />} />
        <Route path="/my-marks" element={<StudentMarksPage />} />
        <Route path="/my-homework" element={<StudentHomeworkPage />} />
        <Route path="/homework/*" element={<HomeworkRoutes />} />
        <Route path="/tests/*" element={<TestRoutes />} />
        <Route path="/marks/*" element={<MarksRoutes />} />
        <Route path="/leaderboards/*" element={<LeaderboardRoutes />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reports/*" element={<ReportRoutes />} />
        <Route path="/analytics" element={<BlockStudent><AnalyticsPage /></BlockStudent>} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/events/*" element={<EventRoutes />} />
        <Route path="/library/*" element={<LibraryRoutes />} />
        <Route path="/transport/*" element={<TransportRoutes />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/remarks" element={<BlockStudent><RemarksPage /></BlockStudent>} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/certificates" element={<BlockStudent><CertificatesPage /></BlockStudent>} />
        <Route path="/fees" element={<BlockStudent><FeesPage /></BlockStudent>} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/exams" element={<ExamSchedulePage />} />
        <Route path="/houses" element={<BlockStudent><HousesPage /></BlockStudent>} />
        <Route path="/settings" element={<BlockStudent><SettingsPage /></BlockStudent>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin/schools" element={<BlockStudent><SchoolsPage /></BlockStudent>} />
        <Route path="/admin/inquiries" element={<BlockStudent><InquiriesPage /></BlockStudent>} />
        <Route path="/admin/import" element={<BlockStudent><ImportPage /></BlockStudent>} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
