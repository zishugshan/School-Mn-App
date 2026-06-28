import { useState, useEffect, useCallback } from 'react'
import { Box, Paper, Typography, Grid, IconButton, Chip, Avatar } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { useAuth } from '@/context/AuthContext'
import { getStudentAttendance } from '@/api/attendance.api'
import api from '@/api/axios'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { AttendanceRecord, AttendanceStatus } from '@/types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: '#4caf50',
  ABSENT: '#f44336',
  LATE: '#ff9800',
  HALF_DAY: '#2196f3',
  LEAVE: '#9e9e9e',
}

const STATUS_BG: Record<string, string> = {
  PRESENT: '#e8f5e9',
  ABSENT: '#ffebee',
  LATE: '#fff3e0',
  HALF_DAY: '#e3f2fd',
  LEAVE: '#f5f5f5',
}

export default function StudentAttendancePage() {
  const { user } = useAuth()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [studentId, setStudentId] = useState<string | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    api.get(`/students/user/${user.id}`).then(r => {
      const data = r.data.data || r.data
      setStudentId(String(data.id))
    }).catch(() => setStudentId(null))
  }, [user?.id])

  const fetchAttendance = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`
    try {
      const resp = await getStudentAttendance(studentId, startDate, endDate)
      setRecords(resp.data.data || [])
    } catch { setRecords([]) }
    finally { setLoading(false) }
  }, [studentId, year, month])

  useEffect(() => { fetchAttendance() }, [fetchAttendance])

  const recordMap = new Map<string, AttendanceRecord>()
  records.forEach(r => recordMap.set(r.date, r))

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  const stats = {
    PRESENT: records.filter(r => r.status === 'PRESENT').length,
    ABSENT: records.filter(r => r.status === 'ABSENT').length,
    LATE: records.filter(r => r.status === 'LATE').length,
    HALF_DAY: records.filter(r => r.status === 'HALF_DAY').length,
    LEAVE: records.filter(r => r.status === 'LEAVE').length,
  }
  const total = records.length
  const presentPct = total > 0 ? Math.round((stats.PRESENT / total) * 100) : 0

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const canGoNext = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth())

  if (studentId === null && !loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="text.secondary">Student profile not found</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>My Attendance</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <IconButton onClick={prevMonth}><ChevronLeft /></IconButton>
              <Typography variant="h6" fontWeight={600}>
                {MONTHS[month]} {year}
              </Typography>
              <IconButton onClick={nextMonth} disabled={!canGoNext}><ChevronRight /></IconButton>
            </Box>

            {loading ? <LoadingSpinner /> : (
              <Box>
                <Grid container spacing={0.5} mb={0.5}>
                  {DAYS.map(d => (
                    <Grid item xs={12 / 7} key={d} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">{d}</Typography>
                    </Grid>
                  ))}
                </Grid>
                <Grid container spacing={0.5}>
                  {calendarDays.map((day, i) => {
                    if (day === null) return <Grid item xs={12 / 7} key={`e-${i}`} />
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const rec = recordMap.get(dateStr)
                    const status = rec?.status
                    return (
                      <Grid item xs={12 / 7} key={dateStr}>
                        <Box
                          sx={{
                            aspectRatio: '1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            bgcolor: status ? STATUS_BG[status] : 'grey.50',
                            border: '1px solid',
                            borderColor: status ? STATUS_COLORS[status] : 'divider',
                            cursor: 'default',
                            p: 0.25,
                            minHeight: 40,
                          }}
                        >
                          <Typography variant="caption" fontWeight={600} fontSize="0.7rem">
                            {day}
                          </Typography>
                          {status && (
                            <Typography variant="caption" fontSize="0.5rem" color={STATUS_COLORS[status]}>
                              {status === 'PRESENT' ? 'P' : status === 'ABSENT' ? 'A' : status === 'LATE' ? 'L' : status === 'HALF_DAY' ? 'HD' : 'LV'}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={1.5}>Monthly Summary</Typography>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, fontSize: 16 }}>
                {presentPct}%
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600}>Attendance Rate</Typography>
                <Typography variant="caption" color="text.secondary">{stats.PRESENT}/{total} days present</Typography>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Chip avatar={<Avatar sx={{ bgcolor: '#4caf50', width: 20, height: 20, fontSize: 10 }}>P</Avatar>}
                label={`Present: ${stats.PRESENT}`} size="small" sx={{ justifyContent: 'flex-start' }} />
              <Chip avatar={<Avatar sx={{ bgcolor: '#f44336', width: 20, height: 20, fontSize: 10 }}>A</Avatar>}
                label={`Absent: ${stats.ABSENT}`} size="small" sx={{ justifyContent: 'flex-start' }} />
              <Chip avatar={<Avatar sx={{ bgcolor: '#ff9800', width: 20, height: 20, fontSize: 10 }}>L</Avatar>}
                label={`Late: ${stats.LATE}`} size="small" sx={{ justifyContent: 'flex-start' }} />
              <Chip avatar={<Avatar sx={{ bgcolor: '#2196f3', width: 20, height: 20, fontSize: 10 }}>H</Avatar>}
                label={`Half Day: ${stats.HALF_DAY}`} size="small" sx={{ justifyContent: 'flex-start' }} />
              <Chip avatar={<Avatar sx={{ bgcolor: '#9e9e9e', width: 20, height: 20, fontSize: 10 }}>V</Avatar>}
                label={`Leave: ${stats.LEAVE}`} size="small" sx={{ justifyContent: 'flex-start' }} />
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Legend</Typography>
            <Box display="flex" flexDirection="column" gap={0.5}>
              {(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'] as AttendanceStatus[]).map(s => (
                <Box key={s} display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: STATUS_COLORS[s] }} />
                  <Typography variant="caption">{s === 'HALF_DAY' ? 'Half Day' : s[0] + s.slice(1).toLowerCase()}</Typography>
                </Box>
              ))}
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }} />
                <Typography variant="caption">No record</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
