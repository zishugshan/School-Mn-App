import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import StudentListPage from './StudentListPage'
import StudentDetailPage from './StudentDetailPage'
import StudentFormPage from './StudentFormPage'

const StudentRoutes: React.FC = () => {
  const { user } = useAuth()
  if (user?.role === 'STUDENT') return <Navigate to="/dashboard" replace />

  return (
    <Routes>
      <Route index element={<StudentListPage />} />
      <Route path="new" element={<StudentFormPage />} />
      <Route path=":id" element={<StudentDetailPage />} />
      <Route path=":id/edit" element={<StudentFormPage />} />
    </Routes>
  )
}

export default StudentRoutes
