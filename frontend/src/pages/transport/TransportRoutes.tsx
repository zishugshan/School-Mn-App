import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import TransportListPage from './TransportListPage'

const TransportRoutes: React.FC = () => {
  const { user } = useAuth()
  if (user?.role === 'STUDENT') return <Navigate to="/dashboard" replace />

  return (
    <Routes>
      <Route index element={<TransportListPage />} />
    </Routes>
  )
}

export default TransportRoutes
