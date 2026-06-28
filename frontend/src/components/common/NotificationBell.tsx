import { useState, useEffect, useRef } from 'react'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popover from '@mui/material/Popover'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import NotificationsIcon from '@mui/icons-material/Notifications'
import CircleIcon from '@mui/icons-material/Circle'
import { Notification } from '../../types'
import { getUnreadCount, getUserNotifications, markAsRead, markAllAsRead } from '../../api/notifications.api'
import { formatDate } from '../../utils/helpers'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NotificationBell: React.FC = () => {
  const { user } = useAuth()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const uid = user?.id || ''

  useEffect(() => {
    if (!uid) return
    fetchUnreadCount()
    intervalRef.current = setInterval(fetchUnreadCount, 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [uid])

  const fetchUnreadCount = async () => {
    if (!uid) return
    try {
      const response = await getUnreadCount(uid)
      setUnreadCount(response.data || 0)
    } catch {
      // silent
    }
  }

  const fetchNotifications = async () => {
    if (!uid) return
    setLoading(true)
    try {
      const response = await getUserNotifications(uid, { page: 0, size: 10 })
      setNotifications((response.data as any)?.content || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
    fetchNotifications()
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMarkAsRead = async (id: string) => {
    if (!uid) return
    try {
      await markAsRead(id, uid)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // silent
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!uid) return
    try {
      await markAllAsRead(uid)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // silent
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }
    handleClose()
    if (notification.link) {
      navigate(notification.link)
    }
  }

  return (
    <>
      <IconButton onClick={handleOpen} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 480 } } }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
          <Typography variant="h6" fontSize={16} fontWeight={600}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 && !loading ? (
          <Box p={4} textAlign="center">
            <Typography variant="body2" color="text.disabled">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notification) => (
              <ListItemButton
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                    <NotificationsIcon fontSize="small" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <CircleIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatDate(notification.createdAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Popover>
    </>
  )
}

export default NotificationBell
