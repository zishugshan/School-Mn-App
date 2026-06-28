import { useState } from 'react'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Grid,
} from '@mui/material'
import { Download, Add } from '@mui/icons-material'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { isStudent } from '@/utils/helpers'


const certificates = [
  { id: '1', title: 'Merit Certificate', studentName: 'Alice Johnson', type: 'merit' as const, issuedDate: '2026-06-15', status: 'issued' as const },
  { id: '2', title: 'Participation - Science Fair', studentName: 'Bob Smith', type: 'participation' as const, issuedDate: '2026-05-20', status: 'issued' as const },
  { id: '3', title: 'Achievement - Sports Day', studentName: 'Charlie Brown', type: 'achievement' as const, issuedDate: '2026-04-10', status: 'issued' as const },
]

const typeColors: Record<string, 'primary' | 'success' | 'info' | 'secondary'> = {
  achievement: 'primary', participation: 'success', merit: 'info', completion: 'secondary',
}

export default function CertificatesPage() {
  const { user } = useAuth()
  const [loading] = useState(false)
  const [requestDialog, setRequestDialog] = useState(false)
  const isStudentUser = isStudent(user?.role || '')

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Certificates</Typography>
        {isStudentUser && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setRequestDialog(true)}>
            Request Certificate
          </Button>
        )}
      </Box>

      {loading ? <LoadingSpinner /> : certificates.length === 0 ? <EmptyState message="No certificates found" /> : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Issue Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {certificates.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.title}</TableCell>
                    <TableCell>{c.studentName}</TableCell>
                    <TableCell><Chip size="small" label={c.type} color={typeColors[c.type]} /></TableCell>
                    <TableCell>{c.issuedDate}</TableCell>
                    <TableCell><Chip size="small" label={c.status} color={c.status === 'issued' ? 'success' : 'warning'} /></TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<Download />} variant="outlined"
                        onClick={() => toast.success('Downloading certificate...')}>
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={requestDialog} onClose={() => setRequestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Certificate</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select label="Type">
                  <MenuItem value="achievement">Achievement</MenuItem>
                  <MenuItem value="participation">Participation</MenuItem>
                  <MenuItem value="merit">Merit</MenuItem>
                  <MenuItem value="completion">Completion</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success('Certificate requested'); setRequestDialog(false) }}>Submit Request</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
