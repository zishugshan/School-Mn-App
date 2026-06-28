import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Grid,
} from '@mui/material'
import { toast } from 'react-toastify'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CreateTestDialog({ open, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [maxMarks, setMaxMarks] = useState(100)
  const [passingMarks, setPassingMarks] = useState(35)
  const [testDate, setTestDate] = useState('')
  const [examType, setExamType] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title || !subjectId || !classId || !testDate) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      toast.success('Test created successfully')
      onClose()
    } catch {
      toast.error('Failed to create test')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Test</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Description" multiline rows={2} value={description}
              onChange={(e) => setDescription(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select value={subjectId} label="Subject" onChange={(e) => setSubjectId(e.target.value)}>
                <MenuItem value="1">Mathematics</MenuItem>
                <MenuItem value="2">Science</MenuItem>
                <MenuItem value="3">English</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select value={classId} label="Class" onChange={(e) => setClassId(e.target.value)}>
                <MenuItem value="1">Class 10</MenuItem>
                <MenuItem value="2">Class 9</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Section</InputLabel>
              <Select value={sectionId} label="Section" onChange={(e) => setSectionId(e.target.value)}>
                <MenuItem value="A">Section A</MenuItem>
                <MenuItem value="B">Section B</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label="Test Date" value={testDate}
              onChange={(e) => setTestDate(e.target.value)} InputLabelProps={{ shrink: true }} required />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth type="number" label="Max Marks" value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value))} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth type="number" label="Passing Marks" value={passingMarks}
              onChange={(e) => setPassingMarks(Number(e.target.value))} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Exam Type</InputLabel>
              <Select value={examType} label="Exam Type" onChange={(e) => setExamType(e.target.value)}>
                <MenuItem value="midterm">Mid-Term</MenuItem>
                <MenuItem value="final">Final</MenuItem>
                <MenuItem value="quiz">Quiz</MenuItem>
                <MenuItem value="unit-test">Unit Test</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
