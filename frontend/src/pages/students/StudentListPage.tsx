import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, TextField, InputAdornment,
} from '@mui/material'
import { Add, Search } from '@mui/icons-material'
import { studentsApi } from '@/api/students.api'
import api from '@/api/axios'

interface StudentRow {
  id: string; name: string; email: string; classId: string; sectionId: string;
  rollNumber: string; gender: string; parentName: string;
}

export default function StudentListPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchStudents = useCallback(async (query?: string) => {
    setLoading(true)
    try {
      const params: Record<string, string> = { size: '200', sort: 'id,desc' }
      if (query) params.search = query
      const [res, parentRes] = await Promise.all([
        studentsApi.getAll(params),
        api.get('/parents').catch(() => ({ data: { data: [] } })),
      ])
      const pageData = res.data?.data
      const parentList: any[] = parentRes.data?.data || []
      const parentMap = new Map<number, string>()
      parentList.forEach((p: any) => {
        const name = p.parentName || '-'
        if (p.studentIds) {
          p.studentIds.forEach((sid: number) => parentMap.set(sid, name))
        }
      })
      const list: StudentRow[] = ((pageData?.content || []) as any[]).map((s: any) => {
        const className = String(s.className || s.classId || '')
        const sectionName = String(s.sectionName || s.sectionId || '')
        return {
          id: String(s.id || ''),
          name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          email: String(s.email || ''),
          classId: sectionName ? `${className.replace('Class ', '')}-${sectionName}` : className,
          sectionId: sectionName,
          rollNumber: String(s.studentCode || ''),
          gender: String(s.gender || ''),
          parentName: parentMap.get(Number(s.id)) || '-',
        }
      })
      setStudents(list)
    } catch {
      setStudents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const filtered = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Students</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/students/new')}>
          Add Student
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          size="small" placeholder="Search students..." value={search}
          onChange={(e) => setSearch(e.target.value)} fullWidth
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        />
      </Paper>

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Loading...</Typography></Paper>
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{search ? 'No students match your search.' : 'No students found. Add one to get started.'}</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Roll No</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Parent Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/students/${s.id}`)}>
                  <TableCell><Typography variant="body2" fontWeight={600}>{s.name}</Typography></TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.classId || '-'}</TableCell>
                  <TableCell>{s.rollNumber || '-'}</TableCell>
                  <TableCell><Chip label={s.gender} size="small" variant="outlined" /></TableCell>
                  <TableCell>{s.parentName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}