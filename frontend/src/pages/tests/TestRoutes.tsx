import { Routes, Route } from 'react-router-dom'
import TestListPage from './TestListPage'
import CreateTestPage from './CreateTestPage'
import TestDetailPage from './TestDetailPage'

const TestRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<TestListPage />} />
      <Route path="new" element={<CreateTestPage />} />
      <Route path=":id" element={<TestDetailPage />} />
    </Routes>
  )
}

export default TestRoutes
