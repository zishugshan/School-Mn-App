import { useState } from 'react'
import {
  Box, Typography, Grid, Card, CardActionArea, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel,
  Select, MenuItem, TextField, Chip,
} from '@mui/material'
import {
  Description, CalendarMonth, Assignment, School,
} from '@mui/icons-material'
import { toast } from 'react-toastify'

const reportTypes = [
  { id: 'student-report-card', label: 'Student Report Card', icon: <Description />, color: '#1976D2' },
  { id: 'attendance-report', label: 'Attendance Report', icon: <CalendarMonth />, color: '#388E3C' },
  { id: 'homework-report', label: 'Homework Report', icon: <Assignment />, color: '#FFA726' },
  { id: 'class-report', label: 'Class Report', icon: <School />, color: '#7B1FA2' },
]

export default function ReportsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [studentId, setStudentId] = useState('')
  const [classId, setClassId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf')
  const [generating, setGenerating] = useState(false)

  const handleOpen = (type: string) => {
    setSelectedType(type)
    setDialogOpen(true)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await new Promise((r) => setTimeout(r, 1500))
      toast.success('Report generated successfully')
      setDialogOpen(false)
    } catch {
      toast.error('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Reports</Typography>
      <Grid container spacing={3}>
        {reportTypes.map((r) => (
          <Grid key={r.id} item xs={12} sm={6} md={3}>
            <Card>
              <CardActionArea onClick={() => handleOpen(r.id)} sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ fontSize: 48, color: r.color, mb: 1 }}>{r.icon}</Box>
                <Typography variant="h6" fontWeight={600}>{r.label}</Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Chip label={reportTypes.find((r) => r.id === selectedType)?.label} color="primary" />
            </Grid>
            {selectedType === 'student-report-card' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Student</InputLabel>
                  <Select value={studentId} label="Student" onChange={(e) => setStudentId(e.target.value)}>
                    <MenuItem value="1">John Doe</MenuItem>
                    <MenuItem value="2">Jane Smith</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {['class-report'].includes(selectedType) && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select value={classId} label="Class" onChange={(e) => setClassId(e.target.value)}>
                    <MenuItem value="1">Class 10</MenuItem>
                    <MenuItem value="2">Class 9</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="From" value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="To" value={dateTo}
                onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select value={format} label="Format" onChange={(e) => setFormat(e.target.value as 'pdf' | 'excel')}>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : 'Generate & Download'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
