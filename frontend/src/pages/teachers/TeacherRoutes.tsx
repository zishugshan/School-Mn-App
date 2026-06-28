import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import TeacherListPage from './TeacherListPage'
import TeacherDetailPage from './TeacherDetailPage'
import TeacherFormPage from './TeacherFormPage'

const TeacherRoutes: React.FC = () => {
  const { user } = useAuth()
  if (user?.role === 'STUDENT') return <Navigate to="/dashboard" replace />

  return (
    <Routes>
      <Route index element={<TeacherListPage />} />
      <Route path="new" element={<TeacherFormPage />} />
      <Route path=":id" element={<TeacherDetailPage />} />
      <Route path=":id/edit" element={<TeacherFormPage />} />
    </Routes>
  )
}

export default TeacherRoutes
