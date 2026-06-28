import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, Chip, CircularProgress,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { examsApi } from '@/api/exams.api'
import api from '@/api/axios'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/utils/helpers'
import type { ExamSchedule } from '@/types'

const EXAM_TYPES = ['MIDTERM', 'FINAL', 'QUIZ', 'ASSIGNMENT', 'OTHER']
const EXAM_TYPE_COLORS: Record<string, 'primary' | 'error' | 'info' | 'warning' | 'default'> = {
  MIDTERM: 'primary', FINAL: 'error', QUIZ: 'info', ASSIGNMENT: 'warning', OTHER: 'default',
}

interface ClassOption { id: string; name: string }
interface SectionOption { id: string; name: string }
interface SubjectOption { id: string; name: string }

export default function ExamSchedulePage() {
  const { user } = useAuth()
  const isAdminUser = isAdmin(user?.role || '')

  const [exams, setExams] = useState<ExamSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const [classes, setClasses] = useState<ClassOption[]>([])
  const [sections, setSections] = useState<SectionOption[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])

  const [form, setForm] = useState({
    title: '', classId: '', sectionId: '', subjectId: '',
    examType: 'MIDTERM', date: '', startTime: '', endTime: '', room: '',
  })

  const fetchExams = () => {
    setLoading(true)
    const promise = isAdminUser ? examsApi.getAll() : examsApi.getMySchedule()
    promise.then(r => {
      const data = r.data?.data || []
      setExams(Array.isArray(data) ? data : [])
    }).catch(() => setExams([])).finally(() => setLoading(false))
  }

  useEffect(() => {
    Promise.all([
      api.get('/classes').then(r => setClasses(r.data?.data || [])),
      api.get('/subjects').then(r => {
        const data = r.data?.data || r.data || []
        setSubjects(Array.isArray(data) ? data : [])
      }),
    ]).catch(() => {})
    fetchExams()
  }, [])

  useEffect(() => {
    if (!form.classId) { setSections([]); return }
    api.get(`/classes/${form.classId}/sections`).then(r => {
      const data = r.data?.data || []
      setSections(Array.isArray(data) ? data.map((s: any) => ({ id: String(s.id), name: s.name })) : [])
    }).catch(() => setSections([]))
  }, [form.classId])

  const openAdd = () => {
    setEditId(null)
    setForm({ title: '', classId: '', sectionId: '', subjectId: '', examType: 'MIDTERM', date: '', startTime: '', endTime: '', room: '' })
    setDialogOpen(true)
  }

  const openEdit = (e: ExamSchedule) => {
    setEditId(e.id)
    setForm({
      title: e.title, classId: '', sectionId: '', subjectId: '',
      examType: e.examType, date: e.date, startTime: e.startTime, endTime: e.endTime, room: e.room || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const payload = {
        title: form.title,
        classId: Number(form.classId),
        sectionId: form.sectionId ? Number(form.sectionId) : null,
        subjectId: Number(form.subjectId),
        examType: form.examType,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        room: form.room,
      }
      if (editId) {
        await examsApi.update(editId, payload)
      } else {
        await examsApi.create(payload)
      }
      setDialogOpen(false)
      fetchExams()
      toast.success(editId ? 'Exam updated' : 'Exam created')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to save exam'
      toast.error(msg)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await examsApi.delete(id)
      fetchExams()
      toast.success('Exam deleted')
    } catch { toast.error('Failed to delete exam') }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Exam Schedule</Typography>
        {isAdminUser && (
          <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Create Exam</Button>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : exams.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No exams scheduled</Typography>
        </Paper>
      ) : (
        <Paper sx={{ overflowX: 'auto' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                  {isAdminUser && <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {exams.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{e.title}</TableCell>
                    <TableCell>{e.subjectName}</TableCell>
                    <TableCell>{e.className}{e.sectionName ? ` - ${e.sectionName}` : ''}</TableCell>
                    <TableCell>
                      <Chip size="small" label={e.examType} color={EXAM_TYPE_COLORS[e.examType] || 'default'} />
                    </TableCell>
                    <TableCell>{e.date}</TableCell>
                    <TableCell>{e.startTime?.substring(0, 5)} – {e.endTime?.substring(0, 5)}</TableCell>
                    <TableCell>{e.room || '-'}</TableCell>
                    {isAdminUser && (
                      <TableCell>
                        <IconButton size="small" onClick={() => openEdit(e)}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(e.id)}><Delete fontSize="small" /></IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Exam' : 'Create Exam'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField size="small" label="Title" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <FormControl size="small" fullWidth>
              <InputLabel>Class</InputLabel>
              <Select value={form.classId} label="Class" onChange={e => setForm(f => ({ ...f, classId: e.target.value, sectionId: '' }))}>
                {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth disabled={!form.classId}>
              <InputLabel>Section</InputLabel>
              <Select value={form.sectionId} label="Section" onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))}>
                {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select value={form.subjectId} label="Subject" onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}>
                {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Exam Type</InputLabel>
              <Select value={form.examType} label="Exam Type" onChange={e => setForm(f => ({ ...f, examType: e.target.value }))}>
                {EXAM_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Date" type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              InputLabelProps={{ shrink: true }} />
            <Box display="flex" gap={2}>
              <TextField size="small" label="Start Time" type="time" value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                InputLabelProps={{ shrink: true }} fullWidth />
              <TextField size="small" label="End Time" type="time" value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                InputLabelProps={{ shrink: true }} fullWidth />
            </Box>
            <TextField size="small" label="Room" value={form.room}
              onChange={e => setForm(f => ({ ...f, room: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
