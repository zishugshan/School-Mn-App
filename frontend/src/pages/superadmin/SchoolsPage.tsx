import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, CircularProgress,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { schoolsApi } from '@/api/schools.api'
import { toast } from 'react-toastify'

interface SchoolRow {
  id: string; name: string; domain?: string; contactEmail?: string;
  contactPhone?: string; city?: string; state?: string;
  subscription?: string; maxStudents?: number; active: boolean; createdAt: string;
}

const defaultForm = { name: '', domain: '', contactEmail: '', contactPhone: '', address: '', city: '', state: '', subscription: 'trial', maxStudents: 500 }

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)

  const fetchSchools = () => {
    setLoading(true)
    schoolsApi.getAll().then(r => {
      const data = r.data?.data || []
      setSchools(Array.isArray(data) ? data : [])
    }).catch(() => setSchools([])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchSchools() }, [])

  const openAdd = () => { setEditId(null); setForm(defaultForm); setDialogOpen(true) }

  const openEdit = (s: SchoolRow) => {
    setEditId(s.id)
    setForm({ name: s.name, domain: s.domain || '', contactEmail: s.contactEmail || '', contactPhone: s.contactPhone || '', address: '', city: s.city || '', state: s.state || '', subscription: s.subscription || 'trial', maxStudents: s.maxStudents || 500 })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const payload = { ...form, maxStudents: Number(form.maxStudents) }
      if (editId) {
        await schoolsApi.update(editId, payload)
        toast.success('School updated')
      } else {
        await schoolsApi.create(payload)
        toast.success('School created')
      }
      setDialogOpen(false)
      fetchSchools()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save school')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await schoolsApi.delete(id)
      fetchSchools()
      toast.success('School removed')
    } catch { toast.error('Failed to delete school') }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Schools</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Add School</Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : schools.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">No schools registered</Typography></Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>School Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Domain</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Max Students</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schools.map(s => (
                <TableRow key={s.id}>
                  <TableCell><Typography variant="body2" fontWeight={600}>{s.name}</Typography></TableCell>
                  <TableCell>{s.domain || '-'}</TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">{s.contactEmail}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.contactPhone}</Typography>
                  </TableCell>
                  <TableCell>{s.city}{s.state ? `, ${s.state}` : ''}</TableCell>
                  <TableCell><Chip size="small" label={s.subscription || 'trial'} color={s.subscription === 'premium' ? 'primary' : s.subscription === 'standard' ? 'info' : 'default'} /></TableCell>
                  <TableCell>{s.maxStudents}</TableCell>
                  <TableCell><Chip size="small" label={s.active ? 'Active' : 'Inactive'} color={s.active ? 'success' : 'default'} /></TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEdit(s)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(s.id)}><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit School' : 'Add School'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField size="small" label="School Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <TextField size="small" label="Domain (e.g. xyz.schoolms.com)" value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} />
            <TextField size="small" label="Contact Email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
            <TextField size="small" label="Contact Phone" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} />
            <TextField size="small" label="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            <TextField size="small" label="State" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
            <TextField size="small" label="Max Students" type="number" value={form.maxStudents} onChange={e => setForm(f => ({ ...f, maxStudents: Number(e.target.value) }))} />
            <TextField size="small" label="Subscription Plan" value={form.subscription} onChange={e => setForm(f => ({ ...f, subscription: e.target.value }))} helperText="trial, standard, or premium" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
