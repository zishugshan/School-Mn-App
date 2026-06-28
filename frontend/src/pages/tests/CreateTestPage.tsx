import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, TextField, Button, Grid, FormControl, InputLabel,
  Select, MenuItem, CircularProgress,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { testsApi } from '@/api/tests.api'
import api from '@/api/axios'

interface OptionItem { id: number; name: string }

const examTypes = ['MIDTERM', 'FINAL', 'QUIZ', 'ASSIGNMENT', 'OTHER']

export default function CreateTestPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [teacherId, setTeacherId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [maximumMarks, setMaximumMarks] = useState(100)
  const [passingMarks, setPassingMarks] = useState(33)
  const [testDate, setTestDate] = useState('')
  const [examType, setExamType] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [subjects, setSubjects] = useState<OptionItem[]>([])
  const [classes, setClasses] = useState<OptionItem[]>([])
  const [sections, setSections] = useState<OptionItem[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    api.get(`/teachers/user/${user.id}`).then(r => {
      const data = r.data.data || r.data
      setTeacherId(Number(data.id))
    }).catch(() => {
      toast.error('Teacher profile not found')
    })
  }, [user?.id])

  useEffect(() => {
    setLoadingOptions(true)
    Promise.all([
      api.get('/subjects').then(r => setSubjects(r.data?.data || [])).catch(() => {}),
      api.get('/classes').then(r => setClasses(r.data?.data || [])).catch(() => {}),
    ]).finally(() => setLoadingOptions(false))
  }, [])

  useEffect(() => {
    if (!classId) { setSections([]); setSectionId(''); return }
    api.get(`/classes/${classId}/sections`).then(r => {
      const data = r.data?.data || []
      setSections(Array.isArray(data) ? data.map((s: any) => ({ id: s.id, name: s.name })) : [])
    }).catch(() => setSections([]))
  }, [classId])

  const handleSubmit = async () => {
    if (!title || !subjectId || !classId || !testDate || !maximumMarks) {
      toast.error('Please fill in all required fields')
      return
    }
    if (!teacherId) {
      toast.error('Your teacher profile is not linked. Contact admin.')
      return
    }
    setSubmitting(true)
    try {
      await testsApi.create({
        title,
        description: description || undefined,
        subjectId: Number(subjectId),
        classId: Number(classId),
        sectionId: sectionId ? Number(sectionId) : null,
        teacherId,
        maximumMarks: Number(maximumMarks),
        passingMarks: passingMarks ? Number(passingMarks) : null,
        testDate,
        examType: examType || undefined,
      })
      toast.success('Test created successfully')
      navigate('/tests')
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to create test'
      toast.error(msg)
      console.error('Create test error:', e?.response?.data || e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button onClick={() => navigate('/tests')}><ArrowBack /></Button>
        <Typography variant="h5" fontWeight={700}>Create Test</Typography>
      </Box>

      <Paper sx={{ p: 3, maxWidth: 700 }}>
        {loadingOptions || !teacherId ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" value={title}
                onChange={(e) => setTitle(e.target.value)} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={3} value={description}
                onChange={(e) => setDescription(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Subject</InputLabel>
                <Select value={subjectId} label="Subject" onChange={(e) => setSubjectId(e.target.value)}>
                  {subjects.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Class</InputLabel>
                <Select value={classId} label="Class" onChange={(e) => { setClassId(e.target.value); setSectionId('') }}>
                  {classes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!classId}>
                <InputLabel>Section (optional)</InputLabel>
                <Select value={sectionId} label="Section (optional)" onChange={(e) => setSectionId(e.target.value)}>
                  {sections.map((s) => (
                    <MenuItem key={s.id} value={s.id}>Section {s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Exam Type</InputLabel>
                <Select value={examType} label="Exam Type" onChange={(e) => setExamType(e.target.value)}>
                  {examTypes.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Test Date" value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="number" label="Maximum Marks" value={maximumMarks}
                onChange={(e) => setMaximumMarks(Number(e.target.value))} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="number" label="Passing Marks" value={passingMarks}
                onChange={(e) => setPassingMarks(Number(e.target.value))} />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button onClick={() => navigate('/tests')}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}
                  disabled={submitting || !title || !subjectId || !classId || !testDate || !maximumMarks}>
                  {submitting ? 'Creating...' : 'Create Test'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  )
}
