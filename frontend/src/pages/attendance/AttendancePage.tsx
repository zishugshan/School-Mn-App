import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, Tabs, Tab, Grid, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField,
  Chip,
} from '@mui/material'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatCard from '@/components/common/StatCard'
import { toast } from 'react-toastify'
import type { AttendanceStatus } from '@/types'
import {
  getAttendanceByClassAndDate,
  getAttendanceByDateRange,
  getAttendanceSummary,
  markBulkAttendance,
  getStudentsByClassAndSection,
  getClasses,
  getSectionsByClass,
} from '@/api/attendance.api'

interface ClassOption { id: string; name: string }
interface SectionOption { id: string; name: string }
interface StudentOption { id: string; firstName: string; lastName: string; studentCode: string }

export default function AttendancePage() {
  const [tab, setTab] = useState(0)
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [sections, setSections] = useState<SectionOption[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [studentStatuses, setStudentStatuses] = useState<Record<string, AttendanceStatus>>({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Monthly report state
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [monthlyRecords, setMonthlyRecords] = useState<Record<string, AttendanceStatus>[]>([])
  const [monthlyLoading, setMonthlyLoading] = useState(false)

  // Analytics state
  const [summary, setSummary] = useState<Record<string, unknown>>({})
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  useEffect(() => {
    getClasses().then(r => setClasses(r.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!classId) { setSections([]); return }
    getSectionsByClass(classId).then(r => setSections(r.data.data || [])).catch(() => {})
  }, [classId])

  const fetchStudents = useCallback(async () => {
    if (!classId || !sectionId) return
    setLoading(true)
    try {
      const resp = await getStudentsByClassAndSection(classId, sectionId)
      const list: StudentOption[] = resp.data.data || []
      setStudents(list)
      const defaults: Record<string, AttendanceStatus> = {}
      list.forEach(s => { defaults[s.id] = 'PRESENT' })
      setStudentStatuses(defaults)
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }, [classId, sectionId])

  useEffect(() => { if (tab === 0) fetchStudents() }, [tab, fetchStudents])

  const loadExisting = useCallback(async () => {
    if (!classId || !sectionId || !date) return
    try {
      const resp = await getAttendanceByClassAndDate(classId, sectionId, date)
      const records = resp.data.data || []
      if (records.length > 0) {
        const map: Record<string, AttendanceStatus> = {}
        records.forEach((r: { studentId: string; status: AttendanceStatus }) => {
          map[r.studentId] = r.status
        })
        setStudentStatuses(prev => ({ ...prev, ...map }))
      }
    } catch { /* no existing records */ }
  }, [classId, sectionId, date])

  useEffect(() => { if (tab === 0) loadExisting() }, [tab, loadExisting])

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentStatuses(prev => ({ ...prev, [studentId]: status }))
  }

  const handleBulkSubmit = async () => {
    if (!classId || !sectionId) {
      toast.error('Please select a class and section')
      return
    }
    setSubmitting(true)
    try {
      await markBulkAttendance({
        classId,
        sectionId,
        date,
        students: students.map(s => ({
          studentId: s.id,
          status: studentStatuses[s.id] || 'PRESENT',
        })),
      })
      toast.success('Attendance marked successfully')
    } catch { toast.error('Failed to submit attendance') }
    finally { setSubmitting(false) }
  }

  const setAllStatus = (status: AttendanceStatus) => {
    const all: Record<string, AttendanceStatus> = {}
    students.forEach(s => { all[s.id] = status })
    setStudentStatuses(all)
  }

  const fetchMonthlyReport = useCallback(async () => {
    if (!classId || !sectionId || !startDate || !endDate) return
    setMonthlyLoading(true)
    try {
      const resp = await getAttendanceByDateRange(classId, sectionId, startDate, endDate)
      setMonthlyRecords(resp.data.data || [])
    } catch { toast.error('Failed to load monthly report') }
    finally { setMonthlyLoading(false) }
  }, [classId, sectionId, startDate, endDate])

  useEffect(() => { if (tab === 1) fetchMonthlyReport() }, [tab, fetchMonthlyReport])

  const fetchAnalytics = useCallback(async () => {
    if (!classId || !sectionId || !date) return
    setAnalyticsLoading(true)
    try {
      const resp = await getAttendanceSummary(classId, sectionId, date)
      setSummary(resp.data.data || {})
    } catch { toast.error('Failed to load analytics') }
    finally { setAnalyticsLoading(false) }
  }, [classId, sectionId, date])

  useEffect(() => { if (tab === 2) fetchAnalytics() }, [tab, fetchAnalytics])

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Attendance Management</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Daily Attendance" />
        <Tab label="Monthly Report" />
        <Tab label="Analytics" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Class</InputLabel>
                  <Select value={classId} label="Class" onChange={e => setClassId(e.target.value)}>
                    {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Section</InputLabel>
                  <Select value={sectionId} label="Section" onChange={e => setSectionId(e.target.value)}>
                    {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth type="date" size="small" label="Date" value={date}
                  onChange={e => setDate(e.target.value)} InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box display="flex" gap={1}>
                  <Button variant="outlined" size="small" onClick={() => setAllStatus('PRESENT')}>All Present</Button>
                  <Button variant="outlined" size="small" color="error" onClick={() => setAllStatus('ABSENT')}>All Absent</Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {loading ? <LoadingSpinner /> : (
            <Paper sx={{ p: 3 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>{s.studentCode}</TableCell>
                        <TableCell>{s.firstName} {s.lastName}</TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={studentStatuses[s.id] || 'PRESENT'}
                              onChange={e => handleStatusChange(s.id, e.target.value as AttendanceStatus)}
                            >
                              <MenuItem value="PRESENT">Present</MenuItem>
                              <MenuItem value="ABSENT">Absent</MenuItem>
                              <MenuItem value="LATE">Late</MenuItem>
                              <MenuItem value="HALF_DAY">Half Day</MenuItem>
                              <MenuItem value="LEAVE">Leave</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    ))}
                    {students.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">Select a class and section to view students</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {students.length > 0 && (
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button variant="contained" onClick={handleBulkSubmit} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Attendance'}
                  </Button>
                </Box>
              )}
            </Paper>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Class</InputLabel>
                  <Select value={classId} label="Class" onChange={e => setClassId(e.target.value)}>
                    {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Section</InputLabel>
                  <Select value={sectionId} label="Section" onChange={e => setSectionId(e.target.value)}>
                    {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth type="date" size="small" label="Start Date" value={startDate}
                  onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth type="date" size="small" label="End Date" value={endDate}
                  onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
          </Paper>

          {monthlyLoading ? <LoadingSpinner /> : (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Attendance Records</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthlyRecords.map((r: Record<string, unknown>, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{(r.studentName as string) || (r.studentId as string)}</TableCell>
                        <TableCell>{r.date ? new Date(r.date as string).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <Chip size="small" label={r.status as string} color={
                            r.status === 'PRESENT' ? 'success' :
                            r.status === 'ABSENT' ? 'error' :
                            r.status === 'LATE' ? 'warning' :
                            r.status === 'LEAVE' ? 'info' : 'default'
                          } />
                        </TableCell>
                      </TableRow>
                    ))}
                    {monthlyRecords.length === 0 && !monthlyLoading && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No records found for the selected period</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Class</InputLabel>
                  <Select value={classId} label="Class" onChange={e => setClassId(e.target.value)}>
                    {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Section</InputLabel>
                  <Select value={sectionId} label="Section" onChange={e => setSectionId(e.target.value)}>
                    {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth type="date" size="small" label="Date" value={date}
                  onChange={e => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
          </Paper>

          {analyticsLoading ? <LoadingSpinner /> : !classId || !sectionId ? (
            <Typography color="text.secondary" align="center" py={4}>Select a class and section to view analytics</Typography>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard label="Present" value={(summary.present as number) ?? 0} color="#388E3C" />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard label="Absent" value={(summary.absent as number) ?? 0} color="#D32F2F" />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard label="Late" value={(summary.late as number) ?? 0} color="#FFA726" />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard label="Half Day" value={(summary.half_day as number) ?? 0} color="#9C27B0" />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard label="Leave" value={(summary.leave as number) ?? 0} color="#1976D2" />
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </Box>
  )
}
