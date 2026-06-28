import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import SubjectListPage from './SubjectListPage'
import SubjectDetailPage from './SubjectDetailPage'

const SubjectRoutes: React.FC = () => {
  const { user } = useAuth()
  if (user?.role === 'STUDENT') return <Navigate to="/dashboard" replace />

  return (
    <Routes>
      <Route index element={<SubjectListPage />} />
      <Route path=":id" element={<SubjectDetailPage />} />
    </Routes>
  )
}

export default SubjectRoutes
