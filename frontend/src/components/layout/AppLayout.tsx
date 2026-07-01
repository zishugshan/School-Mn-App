import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import Sidebar from './Sidebar'
import NotificationBell from '../common/NotificationBell'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    if (!isMobile) setMobileOpen(false)
  }, [isMobile])

  const handleLogout = () => {
    setAnchorEl(null)
    logout()
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isMobile ? (
        <Sidebar open={mobileOpen} onToggle={() => setMobileOpen(!mobileOpen)} mobile />
      ) : (
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      )}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" color="inherit" sx={{ transition: 'all 0.2s ease' }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => isMobile ? setMobileOpen(true) : setSidebarOpen(!sidebarOpen)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }} noWrap>
              School Management
            </Typography>
            <NotificationBell />
            <Tooltip title="Account">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>
                  {user ? getInitials(user.firstName, user.lastName) : '?'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 1.5, sm: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Box>
      </Box>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile') }}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>Profile
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings') }}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>Logout
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default AppLayout
