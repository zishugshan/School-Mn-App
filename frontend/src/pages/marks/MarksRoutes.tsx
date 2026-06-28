import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import EnterMarksPage from './EnterMarksPage'

const MarksRoutes: React.FC = () => {
  const { user } = useAuth()

  if (user?.role === 'STUDENT') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Routes>
      <Route index element={<Navigate to="enter" replace />} />
      <Route path="enter" element={<EnterMarksPage />} />
    </Routes>
  )
}

export default MarksRoutes
