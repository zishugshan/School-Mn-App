import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Button, Chip, FormControl, InputLabel, Select, MenuItem,
  IconButton, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Avatar, CircularProgress,
} from '@mui/material'
import { Add, Search, Visibility, Edit, Delete, FileDownload } from '@mui/icons-material'
import EmptyState from '@/components/common/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { isAdmin } from '@/utils/helpers'
import api from '@/api/axios'

interface StudentRow {
  id: number; firstName: string; lastName: string; email: string; studentCode: string;
  className: string; sectionName: string; houseName: string; gender: string; isActive: boolean;
}

export default function StudentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<StudentRow[]>([])
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const isAdminUser = isAdmin(user?.role || '')

  useEffect(() => {
    api.get('/students', { params: { size: 200 } }).then(r => {
      const data = r.data?.data
      const list = data?.content || data || []
      setStudents(list.map((s: any) => ({
        id: s.id, firstName: s.firstName, lastName: s.lastName, email: s.email || '',
        studentCode: s.studentCode, className: s.className || '-', sectionName: s.sectionName || '',
        houseName: s.houseName || '-', gender: s.gender || '-', isActive: s.isActive !== false,
      })))
    }).catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter((s) => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase()
    const matchSearch = !search || name.includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()) || s.studentCode.toLowerCase().includes(search.toLowerCase())
    const matchClass = !classFilter || s.className.startsWith(classFilter)
    const matchStatus = !statusFilter || (statusFilter === 'active' ? s.isActive : !s.isActive)
    return matchSearch && matchClass && matchStatus
  })

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Students</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<FileDownload />}>Export</Button>
          {isAdminUser && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
              Add Student
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          sx={{ minWidth: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Class</InputLabel>
          <Select value={classFilter} label="Class" onChange={(e) => setClassFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Class 10">Class 10</MenuItem>
            <MenuItem value="Class 9">Class 9</MenuItem>
            <MenuItem value="Class 8">Class 8</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <EmptyState message={search ? 'No students match your search.' : 'No students found.'} />
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>House</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/students/${s.id}`)}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{s.firstName.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{s.firstName} {s.lastName}</Typography>
                          <Typography variant="caption" color="text.secondary">{s.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{s.studentCode}</TableCell>
                    <TableCell>{s.className}{s.sectionName ? ` (${s.sectionName})` : ''}</TableCell>
                    <TableCell>{s.houseName}</TableCell>
                    <TableCell>{s.gender}</TableCell>
                    <TableCell>
                      <Chip size="small" label={s.isActive ? 'Active' : 'Inactive'} color={s.isActive ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/students/${s.id}`) }}>
                        <Visibility />
                      </IconButton>
                      {isAdminUser && (
                        <>
                          <IconButton size="small" onClick={(e) => e.stopPropagation()}><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={(e) => e.stopPropagation()}><Delete /></IconButton>
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
        <DialogTitle>Add Student</DialogTitle>
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
              <TextField fullWidth label="Roll Number" required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select label="Class">
                  <MenuItem value="1">Class 10</MenuItem>
                  <MenuItem value="2">Class 9</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select label="Section">
                  <MenuItem value="A">A</MenuItem>
                  <MenuItem value="B">B</MenuItem>
                </Select>
              </FormControl>
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>House</InputLabel>
                <Select label="House">
                  <MenuItem value="Ruby">Ruby</MenuItem>
                  <MenuItem value="Emerald">Emerald</MenuItem>
                  <MenuItem value="Sapphire">Sapphire</MenuItem>
                  <MenuItem value="Amber">Amber</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" multiline rows={2} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success('Student added'); setDialogOpen(false) }}>Add Student</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}