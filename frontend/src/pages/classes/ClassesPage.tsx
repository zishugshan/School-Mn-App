import { useState } from 'react'
import {
  Box, Paper, Typography, Grid, Card, CardContent, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import { Add, School } from '@mui/icons-material'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { isAdmin } from '@/utils/helpers'


const classes = [
  { id: '1', name: 'Class 10', sections: ['A', 'B'], teacher: 'Mr. John Smith', subjects: ['Mathematics', 'Science', 'English', 'History'], studentCount: 62 },
  { id: '2', name: 'Class 9', sections: ['A', 'B'], teacher: 'Mrs. Sarah Johnson', subjects: ['Mathematics', 'Science', 'English', 'Art'], studentCount: 55 },
  { id: '3', name: 'Class 8', sections: ['A', 'B', 'C'], teacher: 'Ms. Emily Davis', subjects: ['Mathematics', 'Science', 'English', 'Social Studies'], studentCount: 75 },
]

export default function ClassesPage() {
  const { user } = useAuth()
  const [loading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [subjectDialog, setSubjectDialog] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const isAdminUser = isAdmin(user?.role || '')

  const cls = classes.find((c) => c.id === selectedClass)

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Classes</Typography>
        {isAdminUser && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Add Class
          </Button>
        )}
      </Box>

      {loading ? <LoadingSpinner /> : (
        <Grid container spacing={3}>
          {classes.map((c) => (
            <Grid key={c.id} item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: selectedClass === c.id ? 2 : 0,
                  borderColor: 'primary.main',
                }}
                onClick={() => setSelectedClass(c.id)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <School color="primary" />
                    <Typography variant="h6" fontWeight={600}>{c.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Sections: {c.sections.join(', ')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Class Teacher: {c.teacher}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Students: {c.studentCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Subjects: {c.subjects.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {cls && (
        <Paper sx={{ mt: 3, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>{cls.name} - Details</Typography>
            {isAdminUser && (
              <Box display="flex" gap={1}>
                <Button size="small" variant="outlined" onClick={() => setSubjectDialog(true)}>Manage Subjects</Button>
                <Button size="small" variant="outlined" onClick={() => setDialogOpen(true)}>Edit</Button>
              </Box>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Subjects</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Teacher</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cls.subjects.map((s) => (
                      <TableRow key={s}>
                        <TableCell>{s}</TableCell>
                        <TableCell>{cls.teacher}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Sections</Typography>
              <Box display="flex" gap={1}>
                {cls.sections.map((s) => (
                  <Chip key={s} label={`${cls.name} - ${s}`} color="primary" />
                ))}
              </Box>
              <Typography variant="subtitle2" mt={2} gutterBottom>Class Teacher</Typography>
              <Typography variant="body1">{cls.teacher}</Typography>
              <Typography variant="subtitle2" mt={2} gutterBottom>Total Students</Typography>
              <Typography variant="h5" fontWeight={700}>{cls.studentCount}</Typography>
              <Button variant="outlined" size="small" sx={{ mt: 2 }}>View Students</Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedClass ? 'Edit Class' : 'Add Class'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Class Name" required />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Class Teacher</InputLabel>
                <Select label="Class Teacher">
                  <MenuItem value="1">Mr. John Smith</MenuItem>
                  <MenuItem value="2">Mrs. Sarah Johnson</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success(selectedClass ? 'Class updated' : 'Class added'); setDialogOpen(false) }}>{selectedClass ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={subjectDialog} onClose={() => setSubjectDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Subjects</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select label="Subject">
                  <MenuItem value="1">Mathematics</MenuItem>
                  <MenuItem value="2">Science</MenuItem>
                  <MenuItem value="3">English</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubjectDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success('Subject assigned'); setSubjectDialog(false) }}>Assign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
