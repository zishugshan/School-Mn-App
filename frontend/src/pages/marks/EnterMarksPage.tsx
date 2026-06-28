import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Chip, CircularProgress,
} from '@mui/material'
import { Save } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { getClasses, getSectionsByClass, getStudentsByClassAndSection } from '@/api/attendance.api'
import { testsApi } from '@/api/tests.api'

interface ClassItem { id: string; name: string }
interface SectionItem { id: string; name: string }
interface StudentItem { id: string; firstName: string; lastName: string; studentCode: string }
interface TestItem { id: string; title: string; maximumMarks: number }
interface MarkEntry { studentId: string; marksObtained: string; existing?: number }

export default function EnterMarksPage() {
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [testId, setTestId] = useState('')
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [sections, setSections] = useState<SectionItem[]>([])
  const [tests, setTests] = useState<TestItem[]>([])
  const [students, setStudents] = useState<StudentItem[]>([])
  const [marks, setMarks] = useState<MarkEntry[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)

  useEffect(() => { getClasses().then(r => setClasses(r.data.data || [])).catch(() => {}) }, [])

  useEffect(() => {
    if (!classId) { setSections([]); setSectionId(''); return }
    getSectionsByClass(classId).then(r => setSections(r.data.data || [])).catch(() => {})
  }, [classId])

  useEffect(() => {
    if (!classId) { setTests([]); setTestId(''); return }
    testsApi.getByClass(classId).then(r => setTests(r.data.data || [])).catch(() => {})
  }, [classId])

  useEffect(() => {
    if (!classId || !sectionId) { setStudents([]); setMarks([]); return }
    setLoadingStudents(true)
    getStudentsByClassAndSection(classId, sectionId).then(r => {
      const list: StudentItem[] = r.data.data || []
      setStudents(list)
      setMarks(list.map(s => ({ studentId: s.id, marksObtained: '' })))
    }).catch(() => {}).finally(() => setLoadingStudents(false))
  }, [classId, sectionId])

  useEffect(() => {
    if (!testId || students.length === 0) return
    testsApi.getMarks(testId).then(r => {
      const existing: { studentId: string; marksObtained: number }[] = r.data.data || []
      if (existing.length > 0) {
        setMarks(prev => prev.map(m => {
          const found = existing.find(e => String(e.studentId) === m.studentId)
          return found ? { ...m, marksObtained: String(found.marksObtained), existing: found.marksObtained } : m
        }))
      }
    }).catch(() => {})
  }, [testId, students.length])

  const handleMarkChange = (studentId: string, value: string) => {
    setMarks(prev => prev.map(m => m.studentId === studentId ? { ...m, marksObtained: value } : m))
  }

  const handleSubmit = async () => {
    if (!testId) { toast.error('Please select a test'); return }
    const entries = marks
      .filter(m => m.marksObtained !== '')
      .map(m => ({ studentId: m.studentId, marksObtained: parseFloat(m.marksObtained) }))
    if (entries.length === 0) { toast.error('Enter marks for at least one student'); return }
    setSubmitting(true)
    try {
      await testsApi.enterMarks(testId, entries)
      toast.success('Marks saved successfully!')
    } catch {
      toast.error('Failed to save marks')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedTest = tests.find(t => t.id === testId)

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>Enter Marks</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select value={classId} label="Class" onChange={e => { setClassId(e.target.value); setTestId('') }}>
                {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small" disabled={!classId}>
              <InputLabel>Section</InputLabel>
              <Select value={sectionId} label="Section" onChange={e => setSectionId(e.target.value)}>
                {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small" disabled={!classId}>
              <InputLabel>Test</InputLabel>
              <Select value={testId} label="Test" onChange={e => setTestId(e.target.value)}>
                {tests.length === 0 && classId ? (
                  <MenuItem disabled value="">No tests available for this class</MenuItem>
                ) : tests.map(t => <MenuItem key={t.id} value={t.id}>{t.title} (Max: {t.maximumMarks})</MenuItem>)}
              </Select>
            </FormControl>
            {tests.length === 0 && classId && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                No tests found for this class. Create one from the Tests page.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {loadingStudents ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : students.length > 0 ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Marks {selectedTest ? `/ ${selectedTest.maximumMarks}` : ''}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s, i) => {
                const entry = marks.find(m => m.studentId === s.id)
                const val = entry?.marksObtained || ''
                const num = parseFloat(val)
                const hasExisting = entry?.existing != null
                return (
                  <TableRow key={s.id} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {s.firstName} {s.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{s.studentCode}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ maxWidth: 140 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={val}
                        onChange={e => handleMarkChange(s.id, e.target.value)}
                        inputProps={{ min: 0, max: selectedTest?.maximumMarks || 100, step: 0.5 }}
                        sx={{ width: 100 }}
                        placeholder="Marks"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {hasExisting && (
                        <Chip label="Updated" size="small" color="warning" variant="outlined" />
                      )}
                      {val && !isNaN(num) && num >= 0 && (
                        <Chip
                          label={selectedTest && selectedTest.maximumMarks > 0
                            ? `${((num / selectedTest.maximumMarks) * 100).toFixed(1)}%`
                            : `${num}`}
                          size="small"
                          color={num >= (selectedTest?.maximumMarks || 100) * 0.4 ? 'success' : 'error'}
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Marks'}
            </Button>
          </Box>
        </TableContainer>
      ) : classId && sectionId ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No students found for this class and section.</Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Select a class, section, and test to enter marks.</Typography>
        </Paper>
      )}
    </Box>
  )
}
