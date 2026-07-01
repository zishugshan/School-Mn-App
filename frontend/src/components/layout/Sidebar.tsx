import { useNavigate, useLocation } from 'react-router-dom'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import GroupIcon from '@mui/icons-material/Group'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import BookIcon from '@mui/icons-material/Book'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import AssignmentIcon from '@mui/icons-material/Assignment'
import QuizIcon from '@mui/icons-material/Quiz'
import GradingIcon from '@mui/icons-material/Grading'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import AssessmentIcon from '@mui/icons-material/Assessment'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import NotificationsIcon from '@mui/icons-material/Notifications'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import EventIcon from '@mui/icons-material/Event'
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import ChatIcon from '@mui/icons-material/Chat'
import RateReviewIcon from '@mui/icons-material/RateReview'
import FlagIcon from '@mui/icons-material/Flag'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import CottageIcon from '@mui/icons-material/Cottage'
import BusinessIcon from '@mui/icons-material/Business'
import ContactMailIcon from '@mui/icons-material/ContactMail'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import SettingsIcon from '@mui/icons-material/Settings'
import PersonIcon from '@mui/icons-material/Person'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import { UserRole } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { NAVIGATION_WIDTH, COLLAPSED_NAV_WIDTH } from '../../utils/constants'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  roles: UserRole[]
  children?: NavItem[]
}

const ROLES_ALL: UserRole[] = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']

const allNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: ROLES_ALL },
  { label: 'Students', path: '/students', icon: <PeopleIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'] },
  { label: 'Teachers', path: '/teachers', icon: <SchoolIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
  { label: 'Parents', path: '/parents', icon: <GroupIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
  { label: 'Classes', path: '/classes', icon: <MeetingRoomIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'] },
  { label: 'Subjects', path: '/subjects', icon: <BookIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
  { label: 'Attendance', path: '/attendance', icon: <FactCheckIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT'] },
  { label: 'My Attendance', path: '/my-attendance', icon: <FactCheckIcon />, roles: ['STUDENT'] },
  { label: 'My Marks', path: '/my-marks', icon: <GradingIcon />, roles: ['STUDENT'] },
  { label: 'My Homework', path: '/my-homework', icon: <AssignmentIcon />, roles: ['STUDENT'] },
  { label: 'Homework', path: '/homework', icon: <AssignmentIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT'] },
  { label: 'Tests', path: '/tests', icon: <QuizIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
  { label: 'Marks', path: '/marks', icon: <GradingIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT'] },
  { label: 'Leaderboards', path: '/leaderboards', icon: <EmojiEventsIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
  { label: 'Reports', path: '/reports', icon: <AssessmentIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'] },
  { label: 'Analytics', path: '/analytics', icon: <AnalyticsIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
  { label: 'Notifications', path: '/notifications', icon: <NotificationsIcon />, roles: ROLES_ALL },
  { label: 'Calendar', path: '/calendar', icon: <CalendarMonthIcon />, roles: ROLES_ALL },
  { label: 'Events', path: '/events', icon: <EventIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'] },
  { label: 'Library', path: '/library', icon: <LocalLibraryIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'STUDENT', 'TEACHER'] },
  { label: 'Transport', path: '/transport', icon: <DirectionsBusIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
  { label: 'Chat', path: '/chat', icon: <ChatIcon />, roles: ROLES_ALL },
  { label: 'Remarks', path: '/remarks', icon: <RateReviewIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT'] },
  { label: 'Goals', path: '/goals', icon: <FlagIcon />, roles: ['STUDENT', 'TEACHER'] },
  { label: 'Certificates', path: '/certificates', icon: <WorkspacePremiumIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
  { label: 'Fees', path: '/fees', icon: <AccountBalanceWalletIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT'] },
  { label: 'Timetable', path: '/timetable', icon: <CalendarViewWeekIcon />, roles: ROLES_ALL },
  { label: 'Exams', path: '/exams', icon: <FactCheckOutlinedIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
  { label: 'Import', path: '/admin/import', icon: <FileUploadIcon />, roles: ['SUPER_ADMIN'] },
  { label: 'Schools', path: '/admin/schools', icon: <BusinessIcon />, roles: ['SUPER_ADMIN'] },
  { label: 'Inquiries', path: '/admin/inquiries', icon: <ContactMailIcon />, roles: ['SUPER_ADMIN'] },
  { label: 'Houses', path: '/houses', icon: <CottageIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
  { label: 'Profile', path: '/profile', icon: <PersonIcon />, roles: ROLES_ALL },
]

interface SidebarProps {
  open: boolean
  onToggle: () => void
  mobile?: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle, mobile }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const filteredItems = allNavItems.filter(
    (item) => user && item.roles.includes(user.role),
  )

  const drawerWidth = mobile ? NAVIGATION_WIDTH : (open ? NAVIGATION_WIDTH : COLLAPSED_NAV_WIDTH)

  const handleNav = (path: string) => {
    navigate(path)
    if (mobile) onToggle()
  }

  return (
    <Drawer
      variant={mobile ? 'temporary' : 'permanent'}
      open={mobile ? open : true}
      onClose={mobile ? onToggle : undefined}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          transition: mobile ? undefined : 'width 0.2s ease',
          overflowX: 'hidden',
          backgroundColor: '#fafafa',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: open ? 2 : 0,
          py: 2,
          minHeight: 64,
        }}
      >
        {open && (
          <Typography variant="h6" fontWeight={700} color="primary" noWrap>
            SchoolMS
          </Typography>
        )}
        {!mobile && (
          <IconButton onClick={onToggle} size="small">
            {open ? <KeyboardDoubleArrowLeftIcon /> : <KeyboardDoubleArrowRightIcon />}
          </IconButton>
        )}
      </Box>
      <Divider />
      <List sx={{ py: 1 }}>
        {filteredItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <Tooltip key={item.path} title={open ? '' : item.label} placement="right">
              <ListItemButton
                selected={isActive}
                onClick={() => handleNav(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  mb: 0.5,
                  justifyContent: open ? 'initial' : 'center',
                  px: open ? 1.5 : 1,
                  minHeight: 44,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#fff',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: open ? 40 : 0,
                    justifyContent: 'center',
                    color: isActive ? '#fff' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          )
        })}
      </List>
    </Drawer>
  )
}

export default Sidebar
