import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Box, Tabs, Tab } from '@mui/material'
import { LibraryBooks, MenuBook } from '@mui/icons-material'
import LibraryListPage from './LibraryListPage'
import LibraryPage from './LibraryPage'

const LibraryRoutes: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const tabValue = location.pathname.endsWith('/resources') ? 1 : 0

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <LibraryBooks sx={{ fontSize: 28, color: 'primary.main' }} />
      </Box>
      <Tabs value={tabValue} onChange={(_, v) => navigate(v === 0 ? '/library' : '/library/resources')} sx={{ mb: 3 }}>
        <Tab icon={<MenuBook />} label="Books" iconPosition="start" />
        <Tab icon={<LibraryBooks />} label="Resources" iconPosition="start" />
      </Tabs>
      <Routes>
        <Route index element={<LibraryPage />} />
        <Route path="resources" element={<LibraryListPage />} />
      </Routes>
    </Box>
  )
}

export default LibraryRoutes
