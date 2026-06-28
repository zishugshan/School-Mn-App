import { Routes, Route } from 'react-router-dom'
import LeaderboardPage from './LeaderboardPage'

const LeaderboardRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<LeaderboardPage />} />
    </Routes>
  )
}

export default LeaderboardRoutes
