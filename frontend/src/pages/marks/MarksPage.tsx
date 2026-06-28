import { useState } from 'react'
import {
  Box, Paper, Typography, Grid, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Button, FormControl,
  InputLabel, Select, MenuItem,
} from '@mui/material'
import { Line } from 'react-chartjs-2'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { isTeacher, isAdmin } from '@/utils/helpers'


const subjects = [
  { id: '1', name: 'Mathematics', obtained: 85, total: 100, average: 72, highest: 98, lowest: 35 },
  { id: '2', name: 'Science', obtained: 78, total: 100, average: 68, highest: 95, lowest: 30 },
  { id: '3', name: 'English', obtained: 92, total: 100, average: 75, highest: 96, lowest: 40 },
  { id: '4', name: 'History', obtained: 70, total: 100, average: 65, highest: 90, lowest: 28 },
]

const trendData = {
  labels: ['Test 1', 'Test 2', 'Test 3', 'Mid-Term'],
  datasets: [
    { label: 'My Score', data: [72, 78, 85, 82], borderColor: '#1976D2', tension: 0.4 },
    { label: 'Class Average', data: [65, 68, 72, 70], borderColor: '#FFA726', tension: 0.4 },
  ],
}

const students = [
  { id: 's1', name: 'John Doe', marks: 85 },
  { id: 's2', name: 'Jane Smith', marks: 92 },
  { id: 's3', name: 'Bob Johnson', marks: 78 },
]

export default function MarksPage() {
  const { user } = useAuth()
  const [loading] = useState(false)
  const [view] = useState<'student' | 'teacher'>('student')
  const [testId, setTestId] = useState('')
  const [marks, setMarks] = useState<Record<string, string>>({})
  const isTeacherUser = isTeacher(user?.role || '') || isAdmin(user?.role || '')

  const handleSaveMarks = () => {
    toast.success('Marks saved successfully')
  }

  const overall = subjects.reduce((acc, s) => ({
    obtained: acc.obtained + s.obtained,
    total: acc.total + s.total,
  }), { obtained: 0, total: 0 })

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Marks</Typography>
      {loading ? <LoadingSpinner /> : (
        <Box>
          {view === 'student' && (
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">Total Marks</Typography>
                    <Typography variant="h5" fontWeight={700}>{overall.obtained}/{overall.total}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">Overall Percentage</Typography>
                    <Typography variant="h5" fontWeight={700}>{((overall.obtained / overall.total) * 100).toFixed(1)}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">Class Average</Typography>
                    <Typography variant="h5" fontWeight={700}>70%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">Rank</Typography>
                    <Typography variant="h5" fontWeight={700}>#5</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>Subject-wise Performance</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Obtained</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Percentage</TableCell>
                        <TableCell>Class Avg</TableCell>
                        <TableCell>Highest</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subjects.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.name}</TableCell>
                          <TableCell>{s.obtained}</TableCell>
                          <TableCell>{s.total}</TableCell>
                          <TableCell>{((s.obtained / s.total) * 100).toFixed(1)}%</TableCell>
                          <TableCell>{s.average}%</TableCell>
                          <TableCell>{s.highest}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>Performance Trend</Typography>
                <Line data={trendData} options={{ responsive: true, maintainAspectRatio: false }} height={250} />
              </Paper>
            </Grid>
          </Grid>

          {isTeacherUser && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Enter Marks</Typography>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Test</InputLabel>
                    <Select value={testId} label="Select Test" onChange={(e) => setTestId(e.target.value)}>
                      <MenuItem value="1">Mid-Term Math</MenuItem>
                      <MenuItem value="2">Science Quiz</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Marks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={marks[s.id] || ''}
                            onChange={(e) => setMarks({ ...marks, [s.id]: e.target.value })}
                            inputProps={{ min: 0, max: 100 }} sx={{ width: 100 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button variant="contained" onClick={handleSaveMarks}>Save Marks</Button>
              </Box>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  )
}
