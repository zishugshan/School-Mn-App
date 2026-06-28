import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import ParentListPage from './ParentListPage'
import ParentDetailPage from './ParentDetailPage'

const ParentRoutes: React.FC = () => {
  const { user } = useAuth()
  if (user?.role === 'STUDENT') return <Navigate to="/dashboard" replace />

  return (
    <Routes>
      <Route index element={<ParentListPage />} />
      <Route path=":id" element={<ParentDetailPage />} />
    </Routes>
  )
}

export default ParentRoutes
