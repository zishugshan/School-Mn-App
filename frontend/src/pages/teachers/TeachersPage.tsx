import { useState } from 'react'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, Avatar, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import { Add, Edit, Delete, Visibility } from '@mui/icons-material'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { isAdmin } from '@/utils/helpers'


const teachers = [
  { id: '1', name: 'Mr. John Smith', email: 'smith@school.com', employeeCode: 'TCH-001', subjects: ['Mathematics', 'Physics'], classes: ['10-A', '10-B'], phone: '+1-555-0101', status: 'active' as const },
  { id: '2', name: 'Mrs. Sarah Johnson', email: 'johnson@school.com', employeeCode: 'TCH-002', subjects: ['Science', 'Chemistry'], classes: ['10-A', '9-A'], phone: '+1-555-0102', status: 'active' as const },
  { id: '3', name: 'Ms. Emily Davis', email: 'davis@school.com', employeeCode: 'TCH-003', subjects: ['English'], classes: ['10-A', '10-B'], phone: '+1-555-0103', status: 'inactive' as const },
]

export default function TeachersPage() {
  const { user } = useAuth()
  const [loading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const isAdminUser = isAdmin(user?.role || '')

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Teachers</Typography>
        {isAdminUser && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Add Teacher
          </Button>
        )}
      </Box>

      {loading ? <LoadingSpinner /> : teachers.length === 0 ? <EmptyState message="No teachers found" /> : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Employee Code</TableCell>
                  <TableCell>Subjects</TableCell>
                  <TableCell>Classes</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{t.name.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{t.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{t.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{t.employeeCode}</TableCell>
                    <TableCell>{t.subjects.join(', ')}</TableCell>
                    <TableCell>{t.classes.join(', ')}</TableCell>
                    <TableCell>
                      <Chip size="small" label={t.status} color={t.status === 'active' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small"><Visibility /></IconButton>
                      {isAdminUser && (
                        <>
                          <IconButton size="small"><Edit /></IconButton>
                          <IconButton size="small" color="error"><Delete /></IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Teacher</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full Name" required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" type="email" required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Employee Code" required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select label="Gender">
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Qualification" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Specialization" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success('Teacher added'); setDialogOpen(false) }}>Add Teacher</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
