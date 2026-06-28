import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, Grid, TextField, Button, FormControl, InputLabel,
  Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { isTeacher, isAdmin } from '@/utils/helpers'
import { remarksApi } from '@/api/remarks.api'
import type { Remark } from '@/types'

const typeColors: Record<string, 'success' | 'error' | 'info'> = {
  positive: 'success', negative: 'error', constructive: 'info',
}

export default function RemarksPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [remarks, setRemarks] = useState<Remark[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterTeacher, setFilterTeacher] = useState('')
  const [filterSubject, setFilterSubject] = useState('')

  const [formStudent, setFormStudent] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formRemark, setFormRemark] = useState('')
  const [formType, setFormType] = useState<'positive' | 'negative' | 'constructive'>('positive')

  const isTeacherUser = isTeacher(user?.role || '') || isAdmin(user?.role || '')

  const fetchRemarks = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filterTeacher) params.teacherName = filterTeacher
      if (filterSubject) params.subjectName = filterSubject
      const res = await remarksApi.getAll(Object.keys(params).length > 0 ? params : undefined)
      setRemarks(res.data.data || [])
    } catch { toast.error('Failed to load remarks') }
    finally { setLoading(false) }
  }, [filterTeacher, filterSubject])

  useEffect(() => { fetchRemarks() }, [fetchRemarks])

  const handleCreate = async () => {
    if (!formStudent || !formRemark) {
      toast.error('Please fill in required fields')
      return
    }
    try {
      await remarksApi.create({
        studentId: formStudent,
        remark: formRemark,
        category: formCategory,
        isPositive: formType === 'positive',
      })
      toast.success('Remark added successfully')
      setDialogOpen(false)
      setFormStudent('')
      setFormCategory('')
      setFormRemark('')
      setFormType('positive')
      fetchRemarks()
    } catch { toast.error('Failed to add remark') }
  }

  const displayType = (r: Remark) => r.isPositive ? 'positive' : r.isPositive === false ? 'negative' : 'constructive'

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Remarks</Typography>
        {isTeacherUser && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Add Remark
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Teacher</InputLabel>
          <Select value={filterTeacher} label="Filter by Teacher" onChange={(e) => setFilterTeacher(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {[...new Set(remarks.map(r => r.teacherName))].map(name =>
              <MenuItem key={name} value={name}>{name}</MenuItem>
            )}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Subject</InputLabel>
          <Select value={filterSubject} label="Filter by Subject" onChange={(e) => setFilterSubject(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {[...new Set(remarks.filter(r => r.subjectName).map(r => r.subjectName!))].map(name =>
              <MenuItem key={name} value={name}>{name}</MenuItem>
            )}
          </Select>
        </FormControl>
      </Paper>

      {loading ? <LoadingSpinner /> : remarks.length === 0 ? (
        <EmptyState message="No remarks found" />
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Remark</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {remarks.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.studentName}</TableCell>
                    <TableCell>{r.teacherName}</TableCell>
                    <TableCell>{r.subjectName || '-'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={r.category || 'general'} color="default" />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={displayType(r)} color={typeColors[displayType(r)]} />
                    </TableCell>
                    <TableCell>{r.remark}</TableCell>
                    <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Remark</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Student ID" value={formStudent}
                onChange={(e) => setFormStudent(e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={formCategory} label="Category" onChange={(e) => setFormCategory(e.target.value)}>
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="behavior">Behavior</MenuItem>
                  <MenuItem value="participation">Participation</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={formType} label="Type" onChange={(e) => setFormType(e.target.value as 'positive' | 'negative' | 'constructive')}>
                  <MenuItem value="positive">Positive</MenuItem>
                  <MenuItem value="negative">Negative</MenuItem>
                  <MenuItem value="constructive">Constructive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Remark" multiline rows={3} value={formRemark}
                onChange={(e) => setFormRemark(e.target.value)} required />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
