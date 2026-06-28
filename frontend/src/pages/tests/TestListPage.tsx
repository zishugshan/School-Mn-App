import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, IconButton, FormControl, InputLabel,
  Select, MenuItem,
} from '@mui/material'
import { Add, Delete, Publish } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { getClasses } from '@/api/attendance.api'
import { testsApi, type TestItem } from '@/api/tests.api'
import { useAuth } from '@/context/AuthContext'
import api from '@/api/axios'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface ClassItem { id: string; name: string }

export default function TestListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [classId, setClassId] = useState('')
  const [tests, setTests] = useState<TestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [studentId, setStudentId] = useState<string | null>(null)

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'SUPER_ADMIN' || user?.role === 'SCHOOL_ADMIN'
  const isStudent = user?.role === 'STUDENT'

  useEffect(() => {
    getClasses().then(r => setClasses(r.data.data || [])).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user?.id) return
    if (isTeacher) {
      api.get(`/teachers/user/${user.id}`).then(r => {
        const data = r.data.data || r.data
        setTeacherId(String(data.id))
      }).catch(() => {})
    } else if (isStudent) {
      api.get(`/students/user/${user.id}`).then(r => {
        const data = r.data.data || r.data
        setStudentId(String(data.id))
      }).catch(() => {})
    }
  }, [user?.id, isTeacher, isStudent])

  useEffect(() => {
    if (isTeacher && teacherId) {
      testsApi.getByTeacher(teacherId).then(r => {
        let list: TestItem[] = r.data.data || []
        if (classId) {
          const clsName = classes.find(c => c.id === classId)?.name
          list = list.filter(t => t.className === clsName)
        }
        setTests(list)
      }).catch(() => setTests([]))
    } else if (isStudent && studentId) {
      testsApi.getByStudent(studentId).then(r => {
        setTests(r.data.data || [])
      }).catch(() => setTests([]))
    } else {
      setTests([])
    }
  }, [teacherId, studentId, classId, classes, isTeacher, isStudent])

  const formatClass = (t: TestItem) => {
    const base = t.className.replace('Class ', '')
    return t.sectionName ? `${base}-${t.sectionName}` : base
  }

  const handlePublish = async (testId: string) => {
    try {
      await testsApi.publish(testId)
      toast.success('Test published')
      if (teacherId) {
        const r = await testsApi.getByTeacher(teacherId)
        setTests(r.data.data || [])
      }
    } catch {
      toast.error('Failed to publish test')
    }
  }

  const handleDelete = async (testId: string) => {
    if (!window.confirm('Delete this test? This cannot be undone.')) return
    try {
      await testsApi.delete(testId)
      toast.success('Test deleted')
      if (teacherId) {
        const r = await testsApi.getByTeacher(teacherId)
        setTests(r.data.data || [])
      }
    } catch {
      toast.error('Failed to delete test')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>
          {isStudent ? 'My Upcoming Tests' : 'Tests'}
        </Typography>
        {isTeacher && (
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/tests/new')}>
            Create Test
          </Button>
        )}
      </Box>

      {isTeacher && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <FormControl fullWidth size="small" sx={{ maxWidth: 300 }}>
            <InputLabel>Filter by Class</InputLabel>
            <Select value={classId} label="Filter by Class" onChange={e => setClassId(e.target.value)}>
              <MenuItem value="">All Classes</MenuItem>
              {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>
      )}

      {tests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {isTeacher
              ? 'No tests found. Create your first test!'
              : isStudent
              ? 'No upcoming tests'
              : 'No tests available'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Max Marks</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                {!isStudent && <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>}
                {isTeacher && <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {tests.map(t => (
                <TableRow
                  key={t.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/tests/${t.id}`)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{t.title}</Typography>
                  </TableCell>
                  <TableCell>{t.subjectName}</TableCell>
                  <TableCell>{formatClass(t)}</TableCell>
                  <TableCell>{t.maximumMarks}</TableCell>
                  <TableCell>{t.testDate}</TableCell>
                  <TableCell>
                    <Chip label={t.examType || 'N/A'} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  {!isStudent && (
                    <TableCell>
                      <Chip
                        label={t.isPublished ? 'Published' : 'Draft'}
                        size="small"
                        color={t.isPublished ? 'success' : 'default'}
                      />
                    </TableCell>
                  )}
                  {isTeacher && (
                    <TableCell>
                      <Box display="flex" gap={0.5} onClick={e => e.stopPropagation()}>
                        {!t.isPublished && (
                          <IconButton size="small" color="primary" onClick={() => handlePublish(t.id)}>
                            <Publish fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton size="small" color="error" onClick={() => handleDelete(t.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
