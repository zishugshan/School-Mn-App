import { useState } from 'react'
import {
  Box, Paper, Typography, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel, Select,
  MenuItem, Tabs, Tab,
} from '@mui/material'
import { Add, Payment } from '@mui/icons-material'
import StatCard from '@/components/common/StatCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { isAdmin } from '@/utils/helpers'


const feeRecords = [
  { id: '1', studentName: 'John Doe', feeType: 'Tuition Fee', amount: 500, paidAmount: 500, dueDate: '2026-06-10', status: 'paid' as const },
  { id: '2', studentName: 'Jane Smith', feeType: 'Tuition Fee', amount: 500, paidAmount: 300, dueDate: '2026-06-10', status: 'partial' as const },
  { id: '3', studentName: 'Bob Johnson', feeType: 'Library Fee', amount: 100, paidAmount: 0, dueDate: '2026-06-15', status: 'unpaid' as const },
  { id: '4', studentName: 'Alice Brown', feeType: 'Tuition Fee', amount: 500, paidAmount: 0, dueDate: '2026-06-10', status: 'overdue' as const },
]

const statusColors: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
  paid: 'success', partial: 'warning', unpaid: 'default', overdue: 'error',
}

export default function FeesPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState(0)
  const [loading] = useState(false)
  const [payDialog, setPayDialog] = useState<{ open: boolean; recordId: string }>({ open: false, recordId: '' })
  const [createDialog, setCreateDialog] = useState(false)
  const isAdminUser = isAdmin(user?.role || '')

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Fees</Typography>
        {isAdminUser && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialog(true)}>
            Create Record
          </Button>
        )}
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <StatCard label="Total Due" value="$1,600" color="#1976D2" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Total Paid" value="$800" color="#388E3C" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Balance" value="$800" color="#FFA726" />
        </Grid>
      </Grid>

      <Paper>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, pt: 1 }}>
          <Tab label="All Records" />
          <Tab label="Paid" />
          <Tab label="Due" />
        </Tabs>

        {loading ? <LoadingSpinner /> : feeRecords.length === 0 ? <EmptyState message="No fee records" /> : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Fee Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Paid</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(tab === 0 ? feeRecords : feeRecords.filter((r) => tab === 1 ? r.status === 'paid' : r.status !== 'paid')).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.studentName}</TableCell>
                    <TableCell>{r.feeType}</TableCell>
                    <TableCell>${r.amount}</TableCell>
                    <TableCell>${r.paidAmount}</TableCell>
                    <TableCell>{r.dueDate}</TableCell>
                    <TableCell><Chip size="small" label={r.status} color={statusColors[r.status]} /></TableCell>
                    <TableCell>
                      <Button size="small" variant="contained" startIcon={<Payment />}
                        onClick={() => setPayDialog({ open: true, recordId: r.id })}>
                        Pay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={payDialog.open} onClose={() => setPayDialog({ open: false, recordId: '' })} maxWidth="xs" fullWidth>
        <DialogTitle>Pay Fee</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth type="number" label="Amount" />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select label="Payment Method">
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="bank-transfer">Bank Transfer</MenuItem>
                  <MenuItem value="online">Online Payment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialog({ open: false, recordId: '' })}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success('Payment successful'); setPayDialog({ open: false, recordId: '' }) }}>Pay Now</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Fee Record</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select label="Student">
                  <MenuItem value="1">John Doe</MenuItem>
                  <MenuItem value="2">Jane Smith</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Fee Type" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="number" label="Amount" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Due Date" InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success('Fee record created'); setCreateDialog(false) }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
