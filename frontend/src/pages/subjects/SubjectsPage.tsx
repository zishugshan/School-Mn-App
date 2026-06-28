import { useState } from 'react'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { isAdmin } from '@/utils/helpers'


const subjects = [
  { id: '1', name: 'Mathematics', code: 'MATH101', description: 'Algebra, Geometry, Trigonometry', teachers: ['Mr. John Smith'], classes: ['Class 10', 'Class 9'] },
  { id: '2', name: 'Science', code: 'SCI101', description: 'Physics, Chemistry, Biology', teachers: ['Mrs. Sarah Johnson'], classes: ['Class 10', 'Class 9', 'Class 8'] },
  { id: '3', name: 'English', code: 'ENG101', description: 'Grammar, Literature, Composition', teachers: ['Ms. Emily Davis'], classes: ['Class 10', 'Class 9'] },
  { id: '4', name: 'History', code: 'HIS101', description: 'World History, Geography', teachers: ['Mr. Robert Wilson'], classes: ['Class 10'] },
]

export default function SubjectsPage() {
  const { user } = useAuth()
  const [loading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editSubject, setEditSubject] = useState<typeof subjects[0] | null>(null)
  const isAdminUser = isAdmin(user?.role || '')

  const handleEdit = (subject: typeof subjects[0]) => {
    setEditSubject(subject)
    setDialogOpen(true)
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Subjects</Typography>
        {isAdminUser && (
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditSubject(null); setDialogOpen(true) }}>
            Add Subject
          </Button>
        )}
      </Box>

      {loading ? <LoadingSpinner /> : subjects.length === 0 ? <EmptyState message="No subjects found" /> : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Subject Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Teachers</TableCell>
                  <TableCell>Classes</TableCell>
                  {isAdminUser && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell><Chip size="small" label={s.code} color="primary" variant="outlined" /></TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                    </TableCell>
                    <TableCell>{s.description}</TableCell>
                    <TableCell>
                      {s.teachers.map((t, i) => (
                        <Chip key={i} size="small" label={t} sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell>{s.classes.join(', ')}</TableCell>
                    {isAdminUser && (
                      <TableCell>
                        <IconButton size="small" onClick={() => handleEdit(s)}><Edit /></IconButton>
                        <IconButton size="small" color="error"><Delete /></IconButton>
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
        <DialogTitle>{editSubject ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Subject Name" defaultValue={editSubject?.name || ''} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Subject Code" defaultValue={editSubject?.code || ''} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} defaultValue={editSubject?.description || ''} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success(editSubject ? 'Subject updated' : 'Subject added'); setDialogOpen(false) }}>
            {editSubject ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
