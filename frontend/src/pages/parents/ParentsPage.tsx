import { useState } from 'react'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, Avatar, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import { Add, Link, LinkOff } from '@mui/icons-material'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { isAdmin } from '@/utils/helpers'


const parents = [
  { id: '1', name: 'Robert Wilson', email: 'r.wilson@email.com', phone: '+1-555-0201', students: ['John Wilson (10-A)', 'Emma Wilson (8-B)'], status: 'active' as const },
  { id: '2', name: 'Lisa Brown', email: 'l.brown@email.com', phone: '+1-555-0202', students: ['Alice Brown (8-A)'], status: 'active' as const },
  { id: '3', name: 'Michael Davis', email: 'm.davis@email.com', phone: '+1-555-0203', students: ['Tom Davis (9-B)', 'Sarah Davis (7-A)'], status: 'inactive' as const },
]

export default function ParentsPage() {
  const { user } = useAuth()
  const [loading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [linkDialog, setLinkDialog] = useState(false)
  const isAdminUser = isAdmin(user?.role || '')

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Parents</Typography>
        {isAdminUser && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Add Parent
          </Button>
        )}
      </Box>

      {loading ? <LoadingSpinner /> : parents.length === 0 ? <EmptyState message="No parents found" /> : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Parent</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Linked Students</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parents.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{p.name.charAt(0)}</Avatar>
                        <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>
                      {p.students.map((s, i) => (
                        <Chip key={i} size="small" label={s} sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={p.status} color={p.status === 'active' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>
                      {isAdminUser && (
                        <>
                          <IconButton size="small" onClick={() => setLinkDialog(true)} title="Link Student">
                            <Link />
                          </IconButton>
                          <IconButton size="small" color="error" title="Unlink Student">
                            <LinkOff />
                          </IconButton>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Parent</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name" required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" type="email" required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Phone" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Occupation" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success('Parent added'); setDialogOpen(false) }}>Add Parent</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={linkDialog} onClose={() => setLinkDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Link Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select label="Student">
                  <MenuItem value="1">John Wilson (10-A)</MenuItem>
                  <MenuItem value="2">Alice Brown (8-A)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success('Student linked'); setLinkDialog(false) }}>Link</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
