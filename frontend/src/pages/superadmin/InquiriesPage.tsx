import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material'
import { Visibility, MarkEmailRead } from '@mui/icons-material'
import api from '@/api/axios'
import { toast } from 'react-toastify'

interface Inquiry {
  id: string; name: string; email: string; phone?: string;
  schoolName?: string; message?: string; read: boolean; createdAt: string;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Inquiry | null>(null)

  const fetch = () => {
    setLoading(true)
    api.get('/contact').then(r => {
      const data = r.data?.data || []
      setInquiries(Array.isArray(data) ? data : [])
    }).catch(() => setInquiries([])).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const markRead = async (id: string) => {
    try {
      await api.put(`/contact/${id}/read`)
      fetch()
      toast.success('Marked as read')
    } catch { toast.error('Failed to update') }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Contact Inquiries</Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : inquiries.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">No inquiries yet</Typography></Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>School</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inquiries.map(inq => (
                <TableRow key={inq.id} sx={{ ...(!inq.read ? { bgcolor: 'action.hover' } : {}) }}>
                  <TableCell><Typography variant="body2" fontWeight={600}>{inq.name}</Typography></TableCell>
                  <TableCell>{inq.email}</TableCell>
                  <TableCell>{inq.phone || '-'}</TableCell>
                  <TableCell>{inq.schoolName || '-'}</TableCell>
                  <TableCell>{inq.createdAt?.substring(0, 10)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={inq.read ? 'Read' : 'New'} color={inq.read ? 'default' : 'primary'} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => setSelected(inq)}><Visibility fontSize="small" /></IconButton>
                    {!inq.read && (
                      <IconButton size="small" color="primary" onClick={() => markRead(inq.id)}><MarkEmailRead fontSize="small" /></IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{selected?.name}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography variant="body2">{selected?.email}</Typography>
            <Typography variant="caption" color="text.secondary">Phone</Typography>
            <Typography variant="body2">{selected?.phone || '-'}</Typography>
            <Typography variant="caption" color="text.secondary">School</Typography>
            <Typography variant="body2">{selected?.schoolName || '-'}</Typography>
            <Typography variant="caption" color="text.secondary">Date</Typography>
            <Typography variant="body2">{selected?.createdAt}</Typography>
            {selected?.message && (
              <>
                <Typography variant="caption" color="text.secondary">Message</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selected.message}</Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {selected && !selected.read && (
            <Button onClick={() => { markRead(selected.id); setSelected(null) }}>Mark as Read</Button>
          )}
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
