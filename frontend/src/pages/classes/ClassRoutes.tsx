import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import ClassListPage from './ClassListPage'
import ClassDetailPage from './ClassDetailPage'

const ClassRoutes: React.FC = () => {
  const { user } = useAuth()
  if (user?.role === 'STUDENT') return <Navigate to="/dashboard" replace />

  return (
    <Routes>
      <Route index element={<ClassListPage />} />
      <Route path=":id" element={<ClassDetailPage />} />
    </Routes>
  )
}

export default ClassRoutes
