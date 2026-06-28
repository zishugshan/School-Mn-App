import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import AttendancePage from './AttendancePage'

const AttendanceRoutes: React.FC = () => {
  const { user } = useAuth()
  if (user?.role === 'STUDENT') return <Navigate to="/dashboard" replace />

  return (
    <Routes>
      <Route index element={<AttendancePage />} />
    </Routes>
  )
}

export default AttendanceRoutes
