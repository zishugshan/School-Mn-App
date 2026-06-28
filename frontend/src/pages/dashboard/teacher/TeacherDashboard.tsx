import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Grid, Paper, Typography, Card, CardContent, Chip, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Popover, List, ListItem, ListItemText,
} from '@mui/material'
import {
  School, Assignment, FactCheck, Quiz, Add,
} from '@mui/icons-material'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import StatCard from '@/components/common/StatCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuth } from '@/context/AuthContext'
import { homeworkApi } from '@/api/homework.api'
import api from '@/api/axios'
import CreateHomeworkDialog from '@/pages/homework/CreateHomeworkDialog'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const performanceData = {
  labels: ['Math', 'Science', 'English', 'History'],
  datasets: [{
    label: 'Class Average', data: [82, 78, 85, 74],
    backgroundColor: '#388E3C',
  }, {
    label: 'Highest', data: [98, 95, 97, 92],
    backgroundColor: '#FFA726',
  }],
}

const timetable = [
  { period: '1st (8:00-8:45)', subject: 'Mathematics', class: '10-A', room: '201' },
  { period: '2nd (8:45-9:30)', subject: 'Mathematics', class: '10-B', room: '202' },
  { period: '3rd (9:30-10:15)', subject: 'Free Period', class: '-', room: '-' },
  { period: '4th (10:30-11:15)', subject: 'Mathematics', class: '9-A', room: '101' },
  { period: '5th (11:15-12:00)', subject: 'Staff Meeting', class: '-', room: 'Conference' },
]

interface HomeworkWithSubmissions {
  id: string; title: string; subjectName: string; className: string; maxScore: number; dueDate: string; submissions: number; totalStudents: number; submittedStudentNames: string[]; notSubmittedStudentNames: string[]; doubts: string[];
}

export default function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [homeworkData, setHomeworkData] = useState<HomeworkWithSubmissions[]>([])
  const [stats, setStats] = useState({ classesHandled: 0, homeworkAssigned: 0, attendanceSubmitted: 0, testsConducted: 0 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null)
  const [popoverNames, setPopoverNames] = useState<string[]>([])
  const [popoverTitle, setPopoverTitle] = useState('')

  useEffect(() => {
    if (!user?.id) return
    api.get(`/teachers/user/${user.id}`).then(r => {
      const data = r.data.data || r.data
      setTeacherId(String(data.id))
    }).catch(() => {
      setTeacherId(null)
      setLoading(false)
    })
  }, [user?.id])

  const loadHomeworkData = useCallback(async (tId: string) => {
    await Promise.all([
      api.get(`/teachers/${tId}/dashboard`).then(r => {
        const d = r.data.data || r.data
        setStats({
          classesHandled: d.classesHandled ?? 0,
          homeworkAssigned: d.homeworkAssigned ?? 0,
          attendanceSubmitted: d.attendanceSubmitted ?? 0,
          testsConducted: d.testsConducted ?? 0,
        })
      }).catch(() => {}),

      homeworkApi.getByTeacher(tId).then(async (hwRes) => {
        const hwList = (hwRes.data?.data?.content || hwRes.data?.data || []) as any[]
        const enriched = await Promise.all(hwList.slice(0, 5).map(async (hw: any) => {
          try {
            const [subRes, doubtRes] = await Promise.all([
              homeworkApi.getSubmissionsByHomework(hw.id),
              homeworkApi.getDoubts(hw.id).catch(() => ({ data: { data: [] } })),
            ])
            const subs: any[] = subRes.data?.data || []
            const doubts: any[] = doubtRes.data?.data || []
            const names = subs.map(s => s.studentName).filter(Boolean)
            const submittedIds = new Set(subs.map(s => String(s.studentId)).filter(Boolean))

            let notSubmittedNames: string[] = []
            const classIds: string[] = hw.targetClassIds || []
            const sectionIds: string[] = hw.targetSectionIds || []
            if (classIds.length > 0) {
              const cid = classIds[0]
              const studentsUrl = sectionIds.length > 0
                ? `/students/class/${cid}/section/${sectionIds[0]}`
                : `/students/class/${cid}`
              const allStudentsRes = await api.get(studentsUrl).catch(() => ({ data: { data: [] } }))
              const allStudents: any[] = allStudentsRes.data?.data || []
              notSubmittedNames = allStudents
                .filter((s: any) => !submittedIds.has(String(s.id)))
                .map((s: any) => `${s.firstName || ''} ${s.lastName || ''}`.trim())
                .filter(Boolean)
            }

            const sectionName = (hw.targetSectionNames?.[0]) || ''
            const className = sectionName
              ? `${(hw.targetClasses?.[0] || '').replace('Class ', '')}-${sectionName}`
              : (hw.targetClasses?.[0]) || '-'

            return {
              id: hw.id, title: hw.title, subjectName: hw.subjectName || '', className,
              maxScore: hw.maxScore ?? 0, dueDate: hw.dueDate, submissions: subs.length, totalStudents: subs.length,
              submittedStudentNames: names,
              notSubmittedStudentNames: notSubmittedNames,
              doubts: doubts.map(d => `${d.senderName}: ${d.message}`),
            } as HomeworkWithSubmissions
          } catch {
            return { id: hw.id, title: hw.title, subjectName: '', className: (hw.targetClasses?.[0]) || '-', maxScore: 0, dueDate: hw.dueDate, submissions: 0, totalStudents: 0, submittedStudentNames: [], notSubmittedStudentNames: [], doubts: [] } as HomeworkWithSubmissions
          }
        }))
        setHomeworkData(enriched)
      }).catch(() => {}),
    ])
  }, [])

  useEffect(() => {
    if (!teacherId) return
    loadHomeworkData(teacherId).finally(() => setLoading(false))
  }, [teacherId, loadHomeworkData])

  if (loading) return <LoadingSpinner />

  return (
    <Box sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="h5" fontWeight={700}>Teacher Dashboard</Typography>
        <Button variant="contained" size="small" onClick={() => navigate('/attendance')}>
          Take Attendance
        </Button>
      </Box>
      <Grid container spacing={1.5} mb={1.5}>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard label="Classes Handled" value={stats.classesHandled} icon={<School />} color="#1976D2" />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard label="Homework Assigned" value={stats.homeworkAssigned} icon={<Assignment />} color="#388E3C" />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard label="Attendance Submitted" value={String(stats.attendanceSubmitted)} icon={<FactCheck />} color="#FFA726" />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard label="Tests Conducted" value={stats.testsConducted} icon={<Quiz />} color="#7B1FA2" />
        </Grid>
      </Grid>

      <Grid container spacing={1.5} mb={1.5}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>Student Performance by Subject</Typography>
            <Box sx={{ height: 160, '& canvas': { maxWidth: '100% !important', maxHeight: '160px !important', width: '100% !important', height: '160px !important' } }}>
              <Bar data={performanceData} options={{ responsive: true, maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>My Classes</Typography>
            {[...Array(Math.max(stats.classesHandled, 1))].map((_, i) => (
              <Card key={i} sx={{ mb: 0.5, cursor: 'pointer' }} onClick={() => navigate('/classes')}>
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="caption" fontWeight={600}>Class {i + 1}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">Click to view details</Typography>
                </CardContent>
              </Card>
            ))}
            <Button size="small" variant="outlined" fullWidth sx={{ mt: 0.5, fontSize: '0.65rem', py: 0 }} onClick={() => navigate('/classes')}>
              View All Classes
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>Today's Timetable</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Period</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Class</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Room</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timetable.map((t) => (
                    <TableRow key={t.period}>
                      <TableCell sx={{ fontSize: '0.7rem' }}>{t.period}</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem' }}>{t.class}</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem' }}>{t.room}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 1.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" fontWeight={600}>Recent Homework</Typography>
          <Box display="flex" gap={1}>
            <Button size="small" variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)} disabled={!teacherId}>
              Create
            </Button>
            <Button size="small" variant="text" sx={{ fontSize: '0.7rem', py: 0 }} onClick={() => navigate('/homework')}>
              View All →
            </Button>
          </Box>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Max Score</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Submitted Students</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Not Submitted Students</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Doubts</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {homeworkData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    No homework assigned yet.
                  </TableCell>
                </TableRow>
              ) : homeworkData.map((h) => (
                <TableRow key={h.id} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/homework/${h.id}`)}>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{h.title}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{h.subjectName || '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{h.className}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{h.maxScore || '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{new Date(h.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>
                    {h.submittedStudentNames.length === 0 ? '-' : (
                      <Chip
                        size="small"
                        label={`${h.submittedStudentNames.length} submitted`}
                        color="success"
                        sx={{ height: 20, fontSize: '0.65rem', cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); setPopoverAnchor(e.currentTarget); setPopoverNames(h.submittedStudentNames); setPopoverTitle('Submitted Students') }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>
                    {h.notSubmittedStudentNames.length === 0 ? '-' : (
                      <Chip
                        size="small"
                        label={`${h.notSubmittedStudentNames.length} pending`}
                        color="error"
                        sx={{ height: 20, fontSize: '0.65rem', cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); setPopoverAnchor(e.currentTarget); setPopoverNames(h.notSubmittedStudentNames); setPopoverTitle('Not Submitted Students') }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {h.doubts.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">-</Typography>
                    ) : (
                      <Chip
                        size="small"
                        label={`${h.doubts.length} doubt${h.doubts.length > 1 ? 's' : ''}`}
                        color="warning"
                        sx={{ height: 20, fontSize: '0.65rem', cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); setPopoverAnchor(e.currentTarget); setPopoverNames(h.doubts); setPopoverTitle('Doubts') }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Popover
        open={!!popoverAnchor}
        anchorEl={popoverAnchor}
        onClose={() => setPopoverAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, pt: 1, fontWeight: 700 }}>{popoverTitle}</Typography>
        <List dense sx={{ maxHeight: 200, overflow: 'auto', minWidth: 160 }}>
          {popoverNames.map((name, i) => (
            <ListItem key={i}><ListItemText primary={name} primaryTypographyProps={{ variant: 'body2' }} /></ListItem>
          ))}
        </List>
      </Popover>

      <CreateHomeworkDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        teacherId={teacherId || ''}
        onSuccess={() => teacherId && loadHomeworkData(teacherId)}
      />
    </Box>
  )
}
