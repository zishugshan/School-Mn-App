import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Grid, Avatar, Chip, Button, Tabs, Tab, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent,
  List, ListItem, ListItemText, LinearProgress, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
} from '@mui/material'
import { ArrowBack, Edit, Add } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { Doughnut, Bar } from 'react-chartjs-2'
import api from '@/api/axios'
import { parentsApi } from '@/api/parents.api'
import { toast } from 'react-toastify'

interface StudentInfo {
  id: number; firstName: string; lastName: string; email: string; studentCode: string;
  className: string; sectionName: string; houseName: string; gender: string;
  dateOfBirth: string; address: string; city: string; state: string; isActive: boolean;
}

interface HomeworkItem {
  id: string; title: string; subjectName: string; dueDate: string; status: string;
}

interface RemarkItem {
  id: string; teacherName: string; remark: string; createdAt: string; category: string;
}

interface GoalItem {
  id: string; title: string; currentProgress: number; targetValue: number; unit: string;
}

interface CertificateItem {
  id: string; certificateType: string; issueDate: string; description: string;
}

export default function StudentDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [tab, setTab] = useState(0)
  const [attendancePct, setAttendancePct] = useState(0)
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [homework, setHomework] = useState<HomeworkItem[]>([])
  const [marks, setMarks] = useState<any[]>([])
  const [marksSummary, setMarksSummary] = useState<any>(null)
  const [remarks, setRemarks] = useState<RemarkItem[]>([])
  const [goals, setGoals] = useState<GoalItem[]>([])
  const [certificates, setCertificates] = useState<CertificateItem[]>([])
  const [parentRecords, setParentRecords] = useState<any[]>([])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editParent, setEditParent] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    occupation: '', address: '', relationship: '',
  })

  useEffect(() => {
    if (!id) return
    setLoading(true)
    const yearStart = `${new Date().getFullYear()}-01-01`
    const today = new Date().toISOString().split('T')[0]
    Promise.all([
      api.get(`/students/${id}`).then(r => {
        const d = r.data?.data || r.data
        setStudent(d)
        return d
      }),
      api.get(`/attendance/student/${id}/percentage`, { params: { startDate: yearStart, endDate: today } }).then(r => {
        const d = r.data?.data
        setAttendancePct(typeof d === 'number' ? d : (d?.percentage ?? 0))
      }).catch(() => {}),
      api.get(`/attendance/student/${id}`, { params: { startDate: yearStart, endDate: today } }).then(r => {
        setAttendanceRecords(r.data?.data || [])
      }).catch(() => {}),
      Promise.all([
        api.get(`/homework/student/${id}`),
        api.get(`/homework/submissions/student/${id}`).catch(() => ({ data: { data: [] } })),
      ]).then(([hwRes, subRes]) => {
        const hwList = (hwRes.data?.data || []) as any[]
        const subs = (subRes.data?.data || []) as any[]
        setHomework(hwList.map((h: any) => {
          const sub = subs.find((s: any) => String(s.homeworkId) === String(h.id))
          let status = 'pending'
          if (sub) {
            if (sub.status === 'COMPLETED') status = 'completed'
            else if (sub.status === 'SUBMITTED') status = 'submitted'
            else status = (sub.status || 'pending').toLowerCase()
          } else if (new Date(h.dueDate) < new Date()) {
            status = 'overdue'
          }
          return { id: h.id, title: h.title, subjectName: h.subjectName || '-', dueDate: h.dueDate, status }
        }))
      }).catch(() => {}),
      api.get(`/marks/student/${id}`).then(r => setMarks(r.data?.data || [])).catch(() => {}),
      api.get(`/marks/student/${id}/summary`).then(r => setMarksSummary(r.data?.data || null)).catch(() => {}),
      api.get(`/remarks/student/${id}`).then(r => {
        const list = (r.data?.data || []) as any[]
        setRemarks(list.map((rm: any) => ({
          id: rm.id, teacherName: rm.teacherName, remark: rm.remark,
          createdAt: rm.createdAt, category: rm.category,
        })))
      }).catch(() => {}),
      api.get(`/goals/student/${id}`).then(r => {
        const list = (r.data?.data || []) as any[]
        setGoals(list.map((g: any) => ({
          id: g.id, title: g.title, currentProgress: Number(g.currentProgress ?? 0),
          targetValue: Number(g.targetValue ?? 1), unit: g.unit || '',
        })))
      }).catch(() => {}),
      api.get(`/certificates/student/${id}`).then(r => {
        const list = (r.data?.data || []) as any[]
        setCertificates(list.map((c: any) => ({
          id: c.id, certificateType: c.certificateType, issueDate: c.issueDate, description: c.description,
        })))
      }).catch(() => {}),
      parentsApi.getByStudentId(id).then(r => {
        setParentRecords(r.data?.data || [])
      }).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [id])

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
  if (!student) return <Typography textAlign="center" py={8} color="error">Student not found</Typography>

  const fullName = `${student.firstName} ${student.lastName}`
  const avgMarks = marksSummary?.averagePercentage ?? marks.reduce((acc: number, m: any) => acc + Number(m.marksObtained ?? 0) / Number(m.maximumMarks ?? 1) * 100, 0) / (marks.length || 1)

  const doughnutData = {
    labels: ['Present', 'Absent'],
    datasets: [{ data: [attendancePct, 100 - attendancePct], backgroundColor: ['#388E3C', '#D32F2F'] }],
  }

  const subjectLabels = marks.map((m: any) => m.testName || m.subjectName || '-')
  const subjectScores = marks.map((m: any) => {
    const obtained = Number(m.marksObtained ?? 0)
    const max = Number(m.maximumMarks ?? 1)
    return Math.round((obtained / max) * 100 * 10) / 10
  })

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/students')} sx={{ mb: 2 }}>
        Back to Students
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 36 }}>
            {fullName.charAt(0)}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={700}>{fullName}</Typography>
            <Typography variant="body2" color="text.secondary">{student.email} | Code: {student.studentCode}</Typography>
            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
              <Chip size="small" label={`${student.className} ${student.sectionName || ''}`} color="primary" />
              {student.houseName && <Chip size="small" label={`House: ${student.houseName}`} color="warning" />}
              <Chip size="small" label={student.gender} />
              <Chip size="small" label={student.isActive ? 'Active' : 'Inactive'} color={student.isActive ? 'success' : 'default'} />
            </Box>
          </Box>
          <Box textAlign="right">
            <Typography variant="h3" fontWeight={700} color="primary.main">{Math.round(avgMarks)}%</Typography>
            <Typography variant="body2" color="text.secondary">Overall Average</Typography>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, pt: 1 }}>
          <Tab label="Attendance" />
          <Tab label="Homework" />
          <Tab label="Marks" />
          <Tab label="Remarks" />
          <Tab label="Goals" />
          <Tab label="Certificates" />
          <Tab label="Parent" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Attendance Overview</Typography>
              <Box sx={{ position: 'relative', width: '100%', maxHeight: 250, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: '100%', maxWidth: 250 }}>
                  <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: true }} />
                </Box>
              </Box>
              <Typography textAlign="center" mt={2} variant="h4" fontWeight={700} color="primary.main">{Math.round(attendancePct)}%</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, maxHeight: 400, overflow: 'auto' }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Attendance Records</Typography>
              {attendanceRecords.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No attendance records found</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Remarks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceRecords.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip size="small" label={r.status} color={r.status === 'PRESENT' ? 'success' : r.status === 'LATE' ? 'warning' : 'error'} />
                          </TableCell>
                          <TableCell>{r.remarks || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        homework.length === 0 ? <Typography variant="body2" color="text.secondary" p={3}>No homework records</Typography> : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {homework.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell>{h.title}</TableCell>
                      <TableCell>{h.subjectName}</TableCell>
                      <TableCell>{new Date(h.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={h.status}
                          color={h.status === 'completed' ? 'success' : h.status === 'submitted' ? 'info' : h.status === 'overdue' ? 'error' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )
      )}

      {tab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Marks</Typography>
              {marks.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No marks recorded</Typography>
              ) : (
                <Box sx={{ position: 'relative', width: '100%', maxHeight: 250 }}>
                  <Bar data={{
                    labels: subjectLabels,
                    datasets: [{ label: 'Percentage (%)', data: subjectScores, backgroundColor: '#1976D2' }],
                  }} options={{ responsive: true, maintainAspectRatio: true, scales: { y: { min: 0, max: 100 } } }} />
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Mark Summary</Typography>
              {marks.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No marks recorded</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Test</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Grade</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {marks.map((m: any) => {
                        const score = Number(m.marksObtained ?? 0)
                        const max = Number(m.maximumMarks ?? 1)
                        const pct = (score / max) * 100
                        const grade = pct >= 90 ? 'A+' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'D'
                        return (
                          <TableRow key={m.id}>
                            <TableCell>{m.testName || '-'}</TableCell>
                            <TableCell>{score}/{max}</TableCell>
                            <TableCell><Chip size="small" label={grade} color={pct >= 75 ? 'success' : pct >= 40 ? 'warning' : 'error'} /></TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {tab === 3 && (
        remarks.length === 0 ? <Typography variant="body2" color="text.secondary" p={3}>No remarks</Typography> : (
          <Paper>
            <List>
              {remarks.map((r) => (
                <ListItem key={r.id} divider>
                  <ListItemText
                    primary={r.remark}
                    secondary={`${r.teacherName} - ${new Date(r.createdAt).toLocaleDateString()}`}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Chip size="small" label={r.category || 'general'} color={r.category === 'positive' ? 'success' : 'info'} />
                </ListItem>
              ))}
            </List>
          </Paper>
        )
      )}

      {tab === 4 && (
        goals.length === 0 ? <Typography variant="body2" color="text.secondary" p={3}>No goals</Typography> : (
          <Grid container spacing={3}>
            {goals.map((g) => {
              const pct = g.targetValue > 0 ? Math.min((g.currentProgress / g.targetValue) * 100, 100) : 0
              return (
                <Grid key={g.id} item xs={12} sm={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{g.title}</Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="body2">Progress: {g.currentProgress}/{g.targetValue} {g.unit}</Typography>
                      <Typography variant="body2">{Math.round(pct)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={pct} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        )
      )}

      {tab === 5 && (
        certificates.length === 0 ? <Typography variant="body2" color="text.secondary" p={3}>No certificates</Typography> : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {certificates.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.description || c.certificateType}</TableCell>
                      <TableCell>{new Date(c.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell><Chip size="small" label={c.certificateType} color="info" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )
      )}

      {tab === 6 && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>Parent / Guardian</Typography>
            {parentRecords.length === 0 && (
              <Button variant="contained" size="small" startIcon={<Add />}
                onClick={() => { setEditForm({ firstName: '', lastName: '', email: '', phone: '', occupation: '', address: '', relationship: '' }); setAddDialogOpen(true) }}>
                Add Parent
              </Button>
            )}
          </Box>
          {parentRecords.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No parent linked to this student</Typography>
          ) : parentRecords.map((p: any) => (
            <Card key={p.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <Typography variant="subtitle1" fontWeight={600}>{p.parentName}</Typography>
                  <Typography variant="body2" color="text.secondary">{p.email} | {p.phone || 'No phone'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Occupation: {p.occupation || '-'} | Relationship: {p.relationship || '-'}
                  </Typography>
                  {p.address && <Typography variant="body2" color="text.secondary">Address: {p.address}</Typography>}
                </Grid>
                <Grid item xs={12} sm={4} textAlign="right">
                  <Button
                    variant="outlined" size="small" startIcon={<Edit />}
                    onClick={() => {
                      setEditParent(p)
                      const names = (p.parentName || '').split(' ')
                      setEditForm({
                        firstName: names[0] || '',
                        lastName: names.slice(1).join(' ') || '',
                        email: p.email || '',
                        phone: p.phone || '',
                        occupation: p.occupation || '',
                        address: p.address || '',
                        relationship: p.relationship || '',
                      })
                      setEditDialogOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                </Grid>
              </Grid>
            </Card>
          ))}
        </Paper>
      )}

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Parent / Guardian</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField label="First Name" size="small" value={editForm.firstName}
              onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
            <TextField label="Last Name" size="small" value={editForm.lastName}
              onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
            <TextField label="Email" size="small" value={editForm.email}
              onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            <TextField label="Phone" size="small" value={editForm.phone}
              onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
            <TextField label="Occupation" size="small" value={editForm.occupation}
              onChange={e => setEditForm(f => ({ ...f, occupation: e.target.value }))} />
            <TextField label="Address" size="small" value={editForm.address} multiline rows={2}
              onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} />
            <TextField label="Relationship" size="small" value={editForm.relationship}
              onChange={e => setEditForm(f => ({ ...f, relationship: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            try {
              await api.post('/parents/with-user', { ...editForm, studentIds: id ? [Number(id)] : [] })
              toast.success('Parent saved successfully')
              setAddDialogOpen(false)
              if (id) {
                const r = await parentsApi.getByStudentId(id)
                setParentRecords(r.data?.data || [])
              }
            } catch { toast.error('Failed to save parent') }
          }}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Parent / Guardian</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField label="First Name" size="small" value={editForm.firstName}
              onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
            <TextField label="Last Name" size="small" value={editForm.lastName}
              onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
            <TextField label="Email" size="small" value={editForm.email}
              onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            <TextField label="Phone" size="small" value={editForm.phone}
              onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
            <TextField label="Occupation" size="small" value={editForm.occupation}
              onChange={e => setEditForm(f => ({ ...f, occupation: e.target.value }))} />
            <TextField label="Address" size="small" value={editForm.address} multiline rows={2}
              onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} />
            <TextField label="Relationship" size="small" value={editForm.relationship}
              onChange={e => setEditForm(f => ({ ...f, relationship: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            if (!editParent) return
            try {
              await api.put(`/parents/${editParent.id}`, editForm)
              setEditDialogOpen(false)
              if (id) {
                const r = await parentsApi.getByStudentId(id)
                setParentRecords(r.data?.data || [])
              }
            } catch { /* ignore */ }
          }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}