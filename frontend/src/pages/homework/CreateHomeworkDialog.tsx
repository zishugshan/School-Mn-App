import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Grid, Box, CircularProgress,
} from '@mui/material'
import { toast } from 'react-toastify'
import { homeworkApi } from '@/api/homework.api'
import api from '@/api/axios'

interface Props {
  open: boolean
  onClose: () => void
  teacherId: string
  onSuccess?: () => void
}

interface OptionItem { id: number; name: string }

export default function CreateHomeworkDialog({ open, onClose, teacherId: propTeacherId, onSuccess }: Props) {
  const [teacherId, setTeacherId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [maxScore, setMaxScore] = useState(100)
  const [submitting, setSubmitting] = useState(false)
  const [subjects, setSubjects] = useState<OptionItem[]>([])
  const [classes, setClasses] = useState<OptionItem[]>([])
  const [sections, setSections] = useState<OptionItem[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  useEffect(() => {
    if (!open) return
    setLoadingOptions(true)
    setTeacherId(propTeacherId || '')
    Promise.all([
      api.get('/subjects').then(r => setSubjects(r.data?.data || [])).catch(() => {}),
      api.get('/classes').then(r => setClasses(r.data?.data || [])).catch(() => {}),
    ]).finally(() => setLoadingOptions(false))
  }, [open, propTeacherId])

  useEffect(() => {
    if (!classId) { setSections([]); setSectionId(''); return }
    api.get(`/classes/${classId}/sections`).then(r => {
      const data = r.data?.data || []
      setSections(Array.isArray(data) ? data.map((s: any) => ({ id: s.id, name: s.name })) : [])
    }).catch(() => setSections([]))
  }, [classId])

  const resetForm = () => {
    setTitle(''); setDescription(''); setSubjectId(''); setClassId(''); setSectionId('')
    setDueDate(''); setMaxScore(100)
  }

  const handleSubmit = async () => {
    if (!title || !subjectId || !classId || !dueDate) {
      toast.error('Please fill in all required fields')
      return
    }
    const tId = Number(teacherId)
    if (!tId) {
      toast.error('Your teacher profile is not linked to this account. Contact admin.')
      return
    }
    setSubmitting(true)
    try {
      const target: { classId: number; sectionId?: number } = { classId: Number(classId) }
      if (sectionId) target.sectionId = Number(sectionId)
      await homeworkApi.createHomework({
        title,
        description,
        subjectId: Number(subjectId),
        teacherId: tId,
        dueDate: new Date(dueDate).toISOString(),
        maxScore,
        targets: [target],
      })
      toast.success('Homework created successfully')
      resetForm()
      onSuccess?.()
      onClose()
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to create homework'
      toast.error(msg)
      console.error('Create homework error:', e?.response?.data || e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Homework</DialogTitle>
      <DialogContent>
        {loadingOptions ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
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
              <TextField fullWidth type="date" label="Due Date" value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="number" label="Max Score" value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))} />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || loadingOptions || !teacherId || !title || !subjectId || !classId || !dueDate}>
          {submitting ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
