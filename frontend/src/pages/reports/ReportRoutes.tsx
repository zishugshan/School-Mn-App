import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import ReportListPage from './ReportListPage'

const ReportRoutes: React.FC = () => {
  const { user } = useAuth()
  if (user?.role === 'STUDENT') return <Navigate to="/dashboard" replace />

  return (
    <Routes>
      <Route index element={<ReportListPage />} />
    </Routes>
  )
}

export default ReportRoutes
