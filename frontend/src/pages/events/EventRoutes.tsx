import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import EventListPage from './EventListPage'
import CreateEventPage from './CreateEventPage'

const EventRoutes: React.FC = () => {
  const { user } = useAuth()
  if (user?.role === 'STUDENT') return <Navigate to="/dashboard" replace />

  return (
    <Routes>
      <Route index element={<EventListPage />} />
      <Route path="new" element={<CreateEventPage />} />
    </Routes>
  )
}

export default EventRoutes
