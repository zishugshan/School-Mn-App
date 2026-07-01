import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, TextField, InputAdornment,
} from '@mui/material'
import { Add, Search } from '@mui/icons-material'
import { teachersApi } from '@/api/teachers.api'

interface TeacherRow {
  id: string; name: string; email: string; employeeCode: string;
  qualification?: string; specialization?: string; phone?: string; status: string;
}

export default function TeacherListPage() {
  const navigate = useNavigate()
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchTeachers = useCallback(async (query?: string) => {
    setLoading(true)
    try {
      const params: Record<string, string> = { size: '200' }
      if (query) params.search = query
      const res = await teachersApi.getAll(params)
      const pageData = res.data?.data
      const list: TeacherRow[] = ((pageData?.content || []) as any[]).map((t: any) => ({
        id: String(t.id || ''),
        name: `${t.firstName || ''} ${t.lastName || ''}`.trim(),
        email: String(t.email || ''),
        employeeCode: String(t.teacherCode || t.employeeCode || ''),
        qualification: String(t.qualification || ''),
        specialization: String(t.specialization || ''),
        phone: String(t.phone || ''),
        status: t.isActive === false ? 'inactive' : 'active',
      }))
      setTeachers(list)
    } catch {
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTeachers() }, [fetchTeachers])

  const filtered = teachers.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.employeeCode?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Teachers</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/teachers/new')}>
          Add Teacher
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          size="small" placeholder="Search teachers..." value={search}
          onChange={(e) => setSearch(e.target.value)} fullWidth
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        />
      </Paper>

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Loading...</Typography></Paper>
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{search ? 'No teachers match your search.' : 'No teachers found. Add one to get started.'}</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Employee Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Qualification</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Specialization</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/teachers/${t.id}`)}>
                  <TableCell><Typography variant="body2" fontWeight={600}>{t.name}</Typography></TableCell>
                  <TableCell>{t.email}</TableCell>
                  <TableCell>{t.employeeCode || '-'}</TableCell>
                  <TableCell>{t.qualification || '-'}</TableCell>
                  <TableCell>{t.specialization || '-'}</TableCell>
                  <TableCell>{t.phone || '-'}</TableCell>
                  <TableCell>
                    <Chip label={t.status} size="small" color={t.status === 'active' ? 'success' : 'default'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
