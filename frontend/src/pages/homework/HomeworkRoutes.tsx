import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import HomeworkListPage from './HomeworkListPage'
import CreateHomeworkPage from './CreateHomeworkPage'
import HomeworkDetailPage from './HomeworkDetailPage'

const HomeworkRoutes: React.FC = () => {
  const { user } = useAuth()
  if (user?.role === 'STUDENT') return <Navigate to="/dashboard" replace />

  return (
    <Routes>
      <Route index element={<HomeworkListPage />} />
      <Route path="new" element={<CreateHomeworkPage />} />
      <Route path=":id" element={<HomeworkDetailPage />} />
    </Routes>
  )
}

export default HomeworkRoutes
