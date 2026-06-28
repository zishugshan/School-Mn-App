import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Grid, Paper, Typography, Button, List, ListItem, ListItemText,
  ListItemAvatar, Avatar,
} from '@mui/material'
import {
  People, School, Class as ClassIcon, TrendingUp, Assignment,
  Event, Payment,
} from '@mui/icons-material'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import StatCard from '@/components/common/StatCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import api from '@/api/axios'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

const recentActivities = [
  { id: '1', text: 'System is running', time: 'Just now', type: 'info' as const },
  { id: '2', text: 'Database connected', time: 'Active', type: 'success' as const },
]

const quickActions = [
  { label: 'Manage Students', icon: <People />, color: 'primary' as const, link: '/students' },
  { label: 'View Classes', icon: <ClassIcon />, color: 'secondary' as const, link: '/classes' },
  { label: 'Homework', icon: <Assignment />, color: 'info' as const, link: '/homework' },
  { label: 'Fees', icon: <Payment />, color: 'warning' as const, link: '/fees' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0 })

  useEffect(() => {
    Promise.all([
      api.get('/students').then(r => {
        const d = r.data?.data || r.data
        setStats(s => ({ ...s, students: Array.isArray(d) ? d.length : d.content?.length || d.totalElements || 0 }))
      }).catch(() => {}),
      api.get('/teachers').then(r => {
        const d = r.data?.data || r.data
        setStats(s => ({ ...s, teachers: Array.isArray(d) ? d.length : d.content?.length || d.totalElements || 0 }))
      }).catch(() => {}),
      api.get('/classes').then(r => {
        const d = r.data?.data || r.data
        setStats(s => ({ ...s, classes: Array.isArray(d) ? d.length : 0 }))
      }).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Attendance %', data: [92, 88, 94, 90, 93, 91],
      fill: true, borderColor: '#1976D2', backgroundColor: 'rgba(25,118,210,0.1)', tension: 0.4,
    }],
  }

  const barData = {
    labels: ['Math', 'Science', 'English', 'History', 'Art', 'PE'],
    datasets: [{
      label: 'Avg Score', data: [85, 78, 82, 74, 90, 88],
      backgroundColor: '#1976D2',
    }],
  }

  const doughnutData = {
    labels: ['Completed', 'Pending', 'Overdue'],
    datasets: [{ data: [65, 25, 10], backgroundColor: ['#388E3C', '#FFA726', '#D32F2F'] }],
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Admin Dashboard</Typography>
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Students" value={stats.students.toLocaleString()} icon={<People />} color="#1976D2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Teachers" value={stats.teachers.toLocaleString()} icon={<School />} color="#388E3C" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Classes" value={stats.classes.toLocaleString()} icon={<ClassIcon />} color="#FFA726" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Attendance %" value="91%" icon={<TrendingUp />} color="#7B1FA2" />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Attendance Trend</Typography>
            <Box sx={{ height: 250 }}>
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Homework Completion</Typography>
            <Box sx={{ height: 250 }}>
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Subject Performance</Typography>
            <Box sx={{ height: 250 }}>
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>System Status</Typography>
            <List dense>
              {recentActivities.map((a) => (
                <ListItem key={a.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: `${a.type === 'success' ? 'success' : 'info'}.light` }}>
                      {a.type === 'success' ? <TrendingUp /> : <Event />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={a.text} secondary={a.time} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>Quick Actions</Typography>
        <Grid container spacing={2}>
          {quickActions.map((action) => (
            <Grid key={action.label}>
              <Button
                variant="outlined"
                color={action.color}
                startIcon={action.icon}
                onClick={() => navigate(action.link)}
                sx={{ py: 1.5, px: 3 }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  )
}
