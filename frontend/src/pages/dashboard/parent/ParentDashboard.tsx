import { useState, useEffect } from 'react'
import { Box, Grid, Paper, Typography, Card, CardContent, Tabs, Tab, Alert, Chip, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Doughnut } from 'react-chartjs-2'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuth } from '@/context/AuthContext'
import api from '@/api/axios'

interface ChildInfo {
  id: number; firstName: string; lastName: string; className?: string;
  studentCode?: string; gender?: string;
}

interface AlertInfo {
  id: string; child: string; message: string; severity: 'warning' | 'error' | 'info' | 'success';
}

export default function ParentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState<ChildInfo[]>([])
  const [selectedChild, setSelectedChild] = useState(0)
  const [childData, setChildData] = useState<Record<number, any>>({})

  useEffect(() => {
    if (!user?.id) return
    api.get(`/parents/user/${user.id}`).then(r => {
      const p = r.data?.data || r.data
      return api.get(`/parents/${p.id}/students`)
    }).then(r => {
      const kids: ChildInfo[] = r.data?.data || []
      setChildren(kids)
      kids.forEach((k) => {
        api.get(`/dashboard/student/${k.id}`).then(r2 => {
          setChildData(prev => ({ ...prev, [k.id]: r2.data?.data || r2.data }))
        }).catch(() => {})
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user?.id])

  if (loading) return <LoadingSpinner />

  const child = children[selectedChild]
  const dashboardData = child ? childData[child.id] : null
  const attendance = dashboardData?.attendancePercentage ?? null
  const avgMarks = dashboardData?.averageMarks ?? null
  const homeworkRate = dashboardData?.homeworkCompletionRate ?? null

  const doughnutData = attendance != null ? {
    labels: ['Present', 'Absent'],
    datasets: [{ data: [attendance, 100 - attendance], backgroundColor: ['#388E3C', '#D32F2F'] }],
  } : null

  const alerts: AlertInfo[] = []
  if (attendance != null && attendance < 75) {
    alerts.push({ id: 'att', child: child ? `${child.firstName} ${child.lastName}` : '', message: `Attendance below 75% (${Math.round(attendance)}%)`, severity: 'error' })
  } else if (attendance != null && attendance < 85) {
    alerts.push({ id: 'att-warn', child: child ? `${child.firstName} ${child.lastName}` : '', message: `Attendance is ${Math.round(attendance)}%`, severity: 'warning' })
  }
  if (homeworkRate != null && homeworkRate < 60) {
    alerts.push({ id: 'hw', child: child ? `${child.firstName} ${child.lastName}` : '', message: `Homework completion is low (${Math.round(homeworkRate)}%)`, severity: 'warning' })
  }

  return (
    <Box sx={{ '& .MuiTab-root': { minWidth: 80 } }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Parent Dashboard</Typography>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>My Children</Typography>
            {children.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No children linked to your account.</Typography>
            ) : (
              <>
                <Tabs value={selectedChild} onChange={(_, v) => setSelectedChild(v)} sx={{ mb: 2 }}>
                  {children.map((c) => <Tab key={c.id} label={`${c.firstName} ${c.lastName}`} />)}
                </Tabs>
                {child && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">Attendance</Typography>
                          <Typography variant="h5" fontWeight={700} color="primary">
                            {attendance != null ? `${Math.round(attendance)}%` : '-'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">Avg Marks</Typography>
                          <Typography variant="h5" fontWeight={700} color="secondary">
                            {avgMarks != null ? `${Math.round(avgMarks)}%` : '-'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">Homework Done</Typography>
                          <Typography variant="h5" fontWeight={700} color="warning.main">
                            {homeworkRate != null ? `${Math.round(homeworkRate)}%` : '-'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      {doughnutData && (
                        <Box sx={{ width: 100, mx: 'auto' }}>
                          <Doughnut data={doughnutData} options={{ cutout: 35, responsive: true }} />
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" gap={1}>
                        <Chip label={`Class: ${child.className || '-'}`} size="small" />
                        <Chip label={`Code: ${child.studentCode || '-'}`} size="small" />
                        <Chip label={child.gender || '-'} size="small" variant="outlined" />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="outlined" size="small" onClick={() => navigate('/my-attendance')}>
                        View Attendance
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Alerts</Typography>
            {alerts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No alerts. Everything looks good!</Typography>
            ) : (
              alerts.map((a) => (
                <Alert key={a.id} severity={a.severity} sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{a.child}</Typography>
                  {a.message}
                </Alert>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
