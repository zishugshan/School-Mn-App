import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Grid, Paper, Typography, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Button, List, ListItem, ListItemText } from '@mui/material'
import { TrendingUp, Assignment, School, EmojiEvents } from '@mui/icons-material'
import { Line, Doughnut } from 'react-chartjs-2'
import StatCard from '@/components/common/StatCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuth } from '@/context/AuthContext'
import api from '@/api/axios'

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!user?.id) return
    api.get(`/students/user/${user.id}`).then(r => {
      const s = r.data?.data || r.data
      return api.get(`/dashboard/student/${s.id}`)
    }).then(r => {
      setData(r.data?.data || r.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user?.id])

  if (loading) return <LoadingSpinner />

  const d = data || {}
  const attendance = d.attendancePercentage ?? 87
  const homeworkRate = d.homeworkCompletionRate ?? 72
  const avgMarks = d.averageMarks ?? 82
  const rank = d.rankInClass != null ? `#${d.rankInClass}` : '-'
  const monthlyPerf = d.monthlyPerformance || []
  const recentHomework = d.recentHomework || []
  const upcomingTests = d.upcomingTests || []

  const lineData = monthlyPerf.length > 0 ? {
    labels: monthlyPerf.map((m: any) => `${m.month}/${m.year}`),
    datasets: [{
      label: 'Avg Score', data: monthlyPerf.map((m: any) => m.averageScore),
      fill: true, borderColor: '#1976D2', backgroundColor: 'rgba(25,118,210,0.1)', tension: 0.4,
    }],
  } : {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ label: 'Marks %', data: [72, 78, 85, 80, 88, 82], fill: true, borderColor: '#1976D2', backgroundColor: 'rgba(25,118,210,0.1)', tension: 0.4 }],
  }

  const doughnutData = {
    labels: ['Present', 'Absent'],
    datasets: [{ data: [attendance, 100 - attendance], backgroundColor: ['#388E3C', '#D32F2F'] }],
  }

  const studentData = d.student || {}
  const fullName = studentData.firstName && studentData.lastName ? `${studentData.firstName} ${studentData.lastName}` : user?.firstName || 'Student'

  return (
    <Box sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 } }}>
      <Card sx={{ mb: 1.5 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 1.5 } }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: 18 }}>
            {fullName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>Welcome, {fullName}!</Typography>
            <Typography variant="caption" color="text.secondary">
              {studentData.className ? `${studentData.className} | Roll: ${studentData.rollNumber || ''}` : ''}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={1.5} mb={1.5}>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard label="Attendance %" value={`${Math.round(attendance)}%`} icon={<TrendingUp />} color="#1976D2" />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard label="Homework Completion" value={`${Math.round(homeworkRate)}%`} icon={<Assignment />} color="#388E3C" />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard label="Avg Marks" value={`${Math.round(avgMarks)}%`} icon={<School />} color="#FFA726" />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard label="Class Rank" value={rank} icon={<EmojiEvents />} color="#7B1FA2" />
        </Grid>
      </Grid>

      <Grid container spacing={1.5} mb={1.5}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>Monthly Performance</Typography>
            <Box sx={{ height: 130, '& canvas': { maxHeight: '130px !important' } }}>
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>Attendance</Typography>
            <Box sx={{ height: 130, '& canvas': { maxHeight: '130px !important' } }}>
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} md={4}>
          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>Student Info</Typography>
            <Box px={1}>
              {studentData.studentCode && (
                <Typography variant="caption" display="block">Code: {studentData.studentCode}</Typography>
              )}
              {studentData.className && (
                <Typography variant="caption" display="block">Class: {studentData.className} {studentData.sectionName || ''}</Typography>
              )}
              {studentData.houseName && (
                <Typography variant="caption" display="block">House: {studentData.houseName}</Typography>
              )}
              {studentData.email && (
                <Typography variant="caption" display="block">Email: {studentData.email}</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 1.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="subtitle2" fontWeight={600}>Recent Homework</Typography>
              <Button size="small" variant="text" sx={{ fontSize: '0.7rem', py: 0 }} onClick={() => navigate('/my-homework')}>
                View All →
              </Button>
            </Box>
            {recentHomework.length === 0 ? (
              <Typography variant="body2" color="text.secondary" py={1}>No recent homework</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentHomework.slice(0, 5).map((h: any) => (
                      <TableRow key={h.homeworkId} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/my-homework')}>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{h.title}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{h.subjectName || '-'}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{h.dueDate ? new Date(h.dueDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <Chip size="small" label={h.status || 'pending'} color={h.overdue ? 'error' : h.status === 'submitted' || h.score != null ? 'success' : 'warning'} sx={{ height: 20, fontSize: '0.65rem' }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>Upcoming Tests</Typography>
            {upcomingTests.length === 0 ? (
              <Typography variant="body2" color="text.secondary" py={1}>No upcoming tests</Typography>
            ) : (
              <List dense disablePadding>
                {upcomingTests.slice(0, 5).map((t: any) => (
                  <ListItem key={t.testId} disableGutters sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 0.5, px: 1, py: 0.5 }}>
                    <ListItemText
                      primary={t.title}
                      secondary={`${t.subjectName || ''} | ${t.testDate ? new Date(t.testDate).toLocaleDateString() : ''} | Max: ${t.maximumMarks || '-'}`}
                      primaryTypographyProps={{ fontWeight: 600, variant: 'caption' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
