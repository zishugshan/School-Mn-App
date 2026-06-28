import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Grid, Chip, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, TextField, Card, CardContent,
} from '@mui/material'
import { ArrowBack, Save, Publish, Delete } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { testsApi } from '@/api/tests.api'
import { getStudentsByClassAndSection } from '@/api/attendance.api'
import { useAuth } from '@/context/AuthContext'
import api from '@/api/axios'

interface TestDetail {
  id: string; title: string; description?: string; subjectName: string;
  className: string; sectionName?: string; teacherName?: string;
  maximumMarks: number; passingMarks?: number; testDate: string;
  examType?: string; isPublished: boolean; createdAt?: string;
}

interface MarkItem {
  id?: string; studentId: string; studentName?: string; studentCode?: string;
  marksObtained?: number; remarks?: string;
}

interface StudentItem { id: string; firstName: string; lastName: string; studentCode: string }

export default function TestDetailPage() {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [test, setTest] = useState<TestDetail | null>(null)
  const [marks, setMarks] = useState<MarkItem[]>([])
  const [studentId, setStudentId] = useState<string | null>(null)
  const [myMarks, setMyMarks] = useState<MarkItem | null>(null)
  const [classAverage, setClassAverage] = useState<number | null>(null)
  const [students, setStudents] = useState<StudentItem[]>([])
  const [editMarks, setEditMarks] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'SUPER_ADMIN' || user?.role === 'SCHOOL_ADMIN'
  const isStudent = user?.role === 'STUDENT'

  useEffect(() => {
    if (!id) return
    testsApi.getById(id).then(r => {
      const t = r.data.data || r.data
      setTest(t)
      document.title = t.title
    }).catch(() => {
      toast.error('Test not found')
      navigate('/tests')
    }).finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => {
    if (!user?.id) return
    if (isStudent) {
      api.get(`/students/user/${user.id}`).then(r => {
        const data = r.data.data || r.data
        setStudentId(String(data.id))
      }).catch(() => {})
    }
  }, [user?.id, isStudent])

  useEffect(() => {
    if (!test || !id) return

    if (isStudent && studentId) {
      testsApi.getMarks(id).then(r => {
        const all: MarkItem[] = r.data.data || []
        const mine = all.find(m => String(m.studentId) === studentId) || null
        setMyMarks(mine)

        const validMarks = all.filter(m => m.marksObtained != null).map(m => Number(m.marksObtained))
        if (validMarks.length > 0) {
          const avg = validMarks.reduce((a, b) => a + b, 0) / validMarks.length
          setClassAverage(Math.round(avg * 10) / 10)
        } else {
          setClassAverage(null)
        }
      }).catch(() => {})
      return
    }

    if (!isStudent) {
      testsApi.getMarks(id).then(r => {
        const list: MarkItem[] = r.data.data || []
        setMarks(list)
        const edits: Record<string, string> = {}
        list.forEach(m => { if (m.studentId) edits[m.studentId] = String(m.marksObtained ?? '') })
        setEditMarks(edits)
      }).catch(() => {})

      if (test.className) {
        const clsName = test.className
        api.get('/classes').then(r => {
          const classes: any[] = r.data.data || []
          const cls = classes.find((c: any) => c.name === clsName)
          if (cls) {
            const sectionFilter = test.sectionName
              ? (s: any) => s.name === test.sectionName
              : () => true
            api.get(`/classes/${cls.id}/sections`).then(r2 => {
              const secs: any[] = r2.data.data || []
              const sec = secs.find(sectionFilter)
              if (sec) {
                getStudentsByClassAndSection(cls.id, sec.id).then(r3 => {
                  setStudents(r3.data.data || [])
                }).catch(() => {})
              }
            }).catch(() => {})
          }
        }).catch(() => {})
      }
    }
  }, [test, id, isStudent, studentId])

  const handlePublish = async () => {
    if (!id) return
    try {
      await testsApi.publish(id)
      toast.success('Test published')
      setTest(prev => prev ? { ...prev, isPublished: true } : null)
    } catch {
      toast.error('Failed to publish test')
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Delete this test? This cannot be undone.')) return
    try {
      await testsApi.delete(id)
      toast.success('Test deleted')
      navigate('/tests')
    } catch {
      toast.error('Failed to delete test')
    }
  }

  const handleSaveMarks = async () => {
    if (!id || students.length === 0) return
    setSaving(true)
    try {
      const entries = students.map(s => ({
        studentId: s.id,
        marksObtained: Number(editMarks[s.id] ?? 0),
      }))
      await testsApi.enterMarks(id, entries)
      toast.success('Marks saved')
      const updated = await testsApi.getMarks(id)
      setMarks(updated.data.data || [])
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save marks')
    } finally {
      setSaving(false)
    }
  }

  const classDisplay = test
    ? `${test.className.replace('Class ', '')}${test.sectionName ? `-${test.sectionName}` : ''}`
    : ''

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />
  if (!test) return null

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button onClick={() => navigate('/tests')}><ArrowBack /></Button>
        <Typography variant="h5" fontWeight={700}>{test.title}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={isStudent ? 12 : 6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Test Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Subject</Typography>
                <Typography>{test.subjectName}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Class</Typography>
                <Typography>{classDisplay}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Date</Typography>
                <Typography>{test.testDate}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Exam Type</Typography>
                <Typography>{test.examType || 'N/A'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Max Marks</Typography>
                <Typography>{test.maximumMarks}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Passing Marks</Typography>
                <Typography>{test.passingMarks ?? 'N/A'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Teacher</Typography>
                <Typography>{test.teacherName || 'N/A'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip label={test.isPublished ? 'Published' : 'Draft'}
                  color={test.isPublished ? 'success' : 'default'} size="small" /></Grid>
            </Grid>
            {isTeacher && (
              <Box mt={2} display="flex" gap={1}>
                {!test.isPublished && (
                  <Button variant="contained" color="success" startIcon={<Publish />}
                    onClick={handlePublish}>Publish</Button>
                )}
                <Button variant="outlined" color="error" startIcon={<Delete />}
                  onClick={handleDelete}>Delete</Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {isStudent ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Your Results</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ bgcolor: '#e3f2fd' }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">Your Marks</Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {myMarks?.marksObtained != null ? myMarks.marksObtained : '-'}
                        <Typography component="span" variant="h6" color="text.secondary">
                          {' '}/ {test.maximumMarks}
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ bgcolor: '#f3e5f5' }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">Class Average</Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {classAverage != null ? classAverage : '-'}
                        <Typography component="span" variant="h6" color="text.secondary">
                          {' '}/ {test.maximumMarks}
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              {myMarks?.remarks && (
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">Remarks</Typography>
                  <Typography>{myMarks.remarks}</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        ) : (
          <>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={600}>Enter Marks</Typography>
                  {students.length > 0 && (
                    <Button variant="contained" size="small" startIcon={<Save />}
                      onClick={handleSaveMarks} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Marks'}
                    </Button>
                  )}
                </Box>
                {students.length === 0 ? (
                  <Typography color="text.secondary" py={2}>
                    Could not load students for this class. Marks can be entered from the Enter Marks page.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Marks ({test.maximumMarks})</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {students.map(s => (
                          <TableRow key={s.id}>
                            <TableCell>{s.firstName} {s.lastName}</TableCell>
                            <TableCell>{s.studentCode}</TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={editMarks[s.id] ?? ''}
                                onChange={(e) => setEditMarks(prev => ({ ...prev, [s.id]: e.target.value }))}
                                inputProps={{ min: 0, max: test.maximumMarks, step: 0.5 }}
                                sx={{ width: 100 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>

            {marks.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} mb={2}>Saved Marks</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Marks Obtained</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {marks.map((m, i) => (
                          <TableRow key={m.studentId || i}>
                            <TableCell>{m.studentName}</TableCell>
                            <TableCell>{m.studentCode}</TableCell>
                            <TableCell>{m.marksObtained}</TableCell>
                            <TableCell>{m.remarks || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </Box>
  )
}
