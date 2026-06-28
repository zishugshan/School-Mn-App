import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, InputAdornment,
} from '@mui/material'
import { Search } from '@mui/icons-material'
import { subjectsApi } from '@/api/subjects.api'

interface SubjectRow {
  id: string; name: string; code: string; description?: string;
  teacherNames?: string[]; classIds?: string[];
}

export default function SubjectListPage() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<SubjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await subjectsApi.getAll()
      setSubjects(res.data?.data || [])
    } catch {
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSubjects() }, [fetchSubjects])

  const filtered = subjects.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Subjects</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          size="small" placeholder="Search subjects..." value={search}
          onChange={(e) => setSearch(e.target.value)} fullWidth
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        />
      </Paper>

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Loading...</Typography></Paper>
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{search ? 'No subjects match your search.' : 'No subjects found.'}</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Subject Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Classes</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Teachers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/subjects/${s.id}`)}>
                  <TableCell><Typography variant="body2" fontWeight={600}>{s.name}</Typography></TableCell>
                  <TableCell>{s.code}</TableCell>
                  <TableCell>{s.description || '-'}</TableCell>
                  <TableCell>{(s.classIds?.length ?? 0)}</TableCell>
                  <TableCell>{(s.teacherNames?.length ?? 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
