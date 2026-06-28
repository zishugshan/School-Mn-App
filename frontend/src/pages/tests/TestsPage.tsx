import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, TextField, DialogActions,
} from '@mui/material'
import { Add, Visibility, Edit } from '@mui/icons-material'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import CreateTestDialog from './CreateTestDialog'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { isTeacher, isAdmin } from '@/utils/helpers'


const tests = [
  { id: '1', title: 'Mid-Term Examination', subject: 'Mathematics', class: '10-A', date: '2026-07-15', maxMarks: 100, published: true },
  { id: '2', title: 'Unit Test 1', subject: 'Science', class: '10-A', date: '2026-06-20', maxMarks: 50, published: true },
  { id: '3', title: 'Weekly Quiz', subject: 'English', class: '9-B', date: '2026-06-28', maxMarks: 30, published: false },
]

export default function TestsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [marksDialog, setMarksDialog] = useState<{ open: boolean; testId: string }>({ open: false, testId: '' })
  const [marks, setMarks] = useState<Record<string, string>>({})
  const isTeacherUser = isTeacher(user?.role || '') || isAdmin(user?.role || '')

  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t) }, [])

  const students = [
    { id: 's1', name: 'John Doe', roll: '1' },
    { id: 's2', name: 'Jane Smith', roll: '2' },
    { id: 's3', name: 'Bob Johnson', roll: '3' },
  ]

  const handleSubmitMarks = () => {
    toast.success('Marks saved successfully')
    setMarksDialog({ open: false, testId: '' })
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Tests</Typography>
        {isTeacherUser && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Create Test
          </Button>
        )}
      </Box>

      {loading ? <LoadingSpinner /> : tests.length === 0 ? (
        <EmptyState message="No tests found" />
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Max Marks</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tests.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>{t.title}</TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell>{t.class}</TableCell>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{t.maxMarks}</TableCell>
                    <TableCell>
                      <Chip size="small" label={t.published ? 'Published' : 'Draft'} color={t.published ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => navigate(`/tests/${t.id}`)}>
                        <Visibility />
                      </IconButton>
                      {isTeacherUser && (
                        <IconButton size="small" onClick={() => setMarksDialog({ open: true, testId: t.id })}>
                          <Edit />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <CreateTestDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      <Dialog open={marksDialog.open} onClose={() => setMarksDialog({ open: false, testId: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Enter Marks</DialogTitle>
        <DialogContent>
          <TableContainer sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Roll</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Marks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.roll}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>
                      <TextField size="small" type="number" value={marks[s.id] || ''}
                        onChange={(e) => setMarks({ ...marks, [s.id]: e.target.value })}
                        inputProps={{ min: 0, max: 100 }} sx={{ width: 80 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarksDialog({ open: false, testId: '' })}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitMarks}>Save Marks</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
