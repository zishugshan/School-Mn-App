import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, List, ListItem, ListItemText, ListItemIcon,
  Button, Chip, IconButton, Divider, FormControl, InputLabel, Select, MenuItem,
  Pagination,
} from '@mui/material'
import {
  Info, Warning, CheckCircle, Error, MarkEmailRead, DoneAll, Circle,
} from '@mui/icons-material'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { toast } from 'react-toastify'

const allNotifications = [
  { id: '1', title: 'Fee Reminder', message: 'Tuition fee for June is due by 10th June', type: 'warning' as const, read: false, createdAt: '2026-06-25T10:00:00Z' },
  { id: '2', title: 'Exam Schedule Published', message: 'Mid-term exams start from July 15', type: 'info' as const, read: false, createdAt: '2026-06-24T08:00:00Z' },
  { id: '3', title: 'Attendance Alert', message: 'Your child was absent on June 20', type: 'error' as const, read: true, createdAt: '2026-06-23T14:00:00Z' },
  { id: '4', title: 'Homework Submitted', message: 'John submitted Mathematics homework', type: 'success' as const, read: true, createdAt: '2026-06-22T16:00:00Z' },
  { id: '5', title: 'Parent-Teacher Meeting', message: 'PTM scheduled for July 2', type: 'info' as const, read: false, createdAt: '2026-06-21T09:00:00Z' },
]

const typeIcons = { info: <Info />, warning: <Warning />, success: <CheckCircle />, error: <Error /> }
const typeColors = { info: 'info' as const, warning: 'warning' as const, success: 'success' as const, error: 'error' as const }
const ITEMS_PER_PAGE = 10

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [notifications, setNotifications] = useState(allNotifications)

  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t) }, [])

  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.type === filter)
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleMarkRead = (id: string) => {
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n))
    toast.success('Marked as read')
  }

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Notifications
          {unreadCount > 0 && (
            <Chip size="small" label={`${unreadCount} unread`} color="primary" sx={{ ml: 2 }} />
          )}
        </Typography>
        <Button startIcon={<DoneAll />} onClick={handleMarkAllRead} disabled={unreadCount === 0}>
          Mark All Read
        </Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select value={filter} label="Filter by Type" onChange={(e) => { setFilter(e.target.value); setPage(1) }}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="info">Info</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="error">Error</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {loading ? <LoadingSpinner /> : paginated.length === 0 ? (
        <EmptyState message="No notifications" />
      ) : (
        <Paper>
          <List disablePadding>
            {paginated.map((n, i) => (
              <Box key={n.id}>
                {i > 0 && <Divider />}
                <ListItem
                  sx={{
                    bgcolor: n.read ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                  secondaryAction={
                    !n.read && (
                      <IconButton edge="end" onClick={() => handleMarkRead(n.id)}>
                        <MarkEmailRead />
                      </IconButton>
                    )
                  }
                >
                  <ListItemIcon>
                    {!n.read && <Circle sx={{ fontSize: 10, color: 'primary.main', position: 'absolute', top: 18, left: 18 }} />}
                    <Box sx={{ color: `${typeColors[n.type]}.main` }}>
                      {typeIcons[n.type]}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={n.title}
                    secondary={`${n.message} - ${new Date(n.createdAt).toLocaleDateString()}`}
                    primaryTypographyProps={{ fontWeight: n.read ? 400 : 700 }}
                  />
                </ListItem>
              </Box>
            ))}
          </List>
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" p={2}>
              <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
            </Box>
          )}
        </Paper>
      )}
    </Box>
  )
}
