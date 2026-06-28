import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress,
} from '@mui/material'
import { Add, Edit, Delete, Settings } from '@mui/icons-material'
import api from '@/api/axios'
import { timetableApi } from '@/api/timetable.api'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/utils/helpers'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday',
}

const DEFAULT_PERIODS = [
  { id: 'P1', label: 'P1', startTime: '08:00', endTime: '08:50' },
  { id: 'P2', label: 'P2', startTime: '09:00', endTime: '09:50' },
  { id: 'P3', label: 'P3', startTime: '10:00', endTime: '10:50' },
  { id: 'P4', label: 'P4', startTime: '11:00', endTime: '11:50' },
  { id: 'P5', label: 'P5', startTime: '12:00', endTime: '12:50' },
  { id: 'P6', label: 'P6', startTime: '13:00', endTime: '13:50' },
]

interface PeriodConfig { id: string; label: string; startTime: string; endTime: string }

interface EntryData { id: number; subject: string; teacher: string; startTime: string; endTime: string; room: string }
interface DaySchedule { day: string; periods: EntryData[] }

export default function TimetablePage() {
  const { user } = useAuth()
  const isAdminUser = isAdmin(user?.role || '')
  const isStudent = user?.role === 'STUDENT'

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([])
  const [sections, setSections] = useState<{ id: string; name: string }[]>([])
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([])
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([])
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [timetable, setTimetable] = useState<DaySchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [periods, setPeriods] = useState<PeriodConfig[]>(DEFAULT_PERIODS)
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false)
  const [cellDialogOpen, setCellDialogOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ day: string; period: PeriodConfig } | null>(null)
  const [editEntryId, setEditEntryId] = useState<number | null>(null)
  const [entryForm, setEntryForm] = useState({ subjectId: '', teacherId: '', room: '' })

  useEffect(() => {
    Promise.all([
      api.get('/classes').then(r => setClasses(r.data?.data || [])),
      api.get('/subjects').then(r => {
        const data = r.data?.data || r.data || []
        setSubjects(Array.isArray(data) ? data : [])
      }),
      api.get('/teachers').then(r => {
        const data = r.data?.data || r.data || []
        if (data.content) setTeachers(data.content.map((t: any) => ({ id: String(t.id), name: `${t.firstName || ''} ${t.lastName || ''}`.trim() })))
        else setTeachers(Array.isArray(data) ? data.map((t: any) => ({ id: String(t.id), name: `${t.firstName || ''} ${t.lastName || ''}`.trim() })) : [])
      }),
      isStudent && user?.id ? api.get(`/students/user/${user.id}`).then(r => {
        const s = r.data?.data || r.data
        if (s) {
          setClassId(String(s.classId || s.classEntity?.id || ''))
          setSectionId(String(s.sectionId || s.section?.id || ''))
        }
      }).catch(() => {}) : Promise.resolve(),
    ]).catch(() => {})
  }, [isStudent, user?.id])

  useEffect(() => {
    if (!classId) { setSections([]); return }
    api.get(`/classes/${classId}/sections`).then(r => {
      const data = r.data?.data || []
      setSections(Array.isArray(data) ? data.map((s: any) => ({ id: String(s.id), name: s.name })) : [])
    }).catch(() => setSections([]))
  }, [classId])

  useEffect(() => {
    if (!classId || !sectionId) { setTimetable([]); return }
    setLoading(true)
    timetableApi.get(classId, sectionId).then(r => {
      const data = r.data?.data || []
      setTimetable(Array.isArray(data) ? data : [])
    }).catch(() => setTimetable([])).finally(() => setLoading(false))
  }, [classId, sectionId])

  useEffect(() => {
    if (!classId || !sectionId) return
    const key = `timetable_periods_${classId}_${sectionId}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try { setPeriods(JSON.parse(stored)) } catch { setPeriods(DEFAULT_PERIODS) }
    } else {
      setPeriods(DEFAULT_PERIODS)
    }
  }, [classId, sectionId])

  const savePeriods = (p: PeriodConfig[]) => {
    setPeriods(p)
    if (classId && sectionId) {
      localStorage.setItem(`timetable_periods_${classId}_${sectionId}`, JSON.stringify(p))
    }
  }

  const getEntry = (day: string, period: PeriodConfig): EntryData | undefined => {
    const ds = timetable.find(d => d.day === day)
    if (!ds) return undefined
    return ds.periods.find(p => p.startTime === period.startTime)
  }

  const openAddCell = (day: string, period: PeriodConfig) => {
    setSelectedCell({ day, period })
    setEditEntryId(null)
    setEntryForm({ subjectId: '', teacherId: '', room: '' })
    setCellDialogOpen(true)
  }

  const openEditCell = (day: string, period: PeriodConfig, entry: EntryData) => {
    setSelectedCell({ day, period })
    setEditEntryId(entry.id)
    setEntryForm({
      subjectId: String(subjects.find(s => s.name === entry.subject)?.id || ''),
      teacherId: String(teachers.find(t => entry.teacher.includes(t.name))?.id || ''),
      room: entry.room || '',
    })
    setCellDialogOpen(true)
  }

  const handleCellSave = async () => {
    if (!selectedCell) return
    try {
      const payload = {
        dayOfWeek: selectedCell.day,
        startTime: selectedCell.period.startTime,
        endTime: selectedCell.period.endTime,
        subjectId: Number(entryForm.subjectId),
        teacherId: Number(entryForm.teacherId),
        room: entryForm.room,
        classId: Number(classId),
        sectionId: Number(sectionId),
      }
      if (editEntryId) {
        await timetableApi.update(String(editEntryId), payload)
      } else {
        await timetableApi.create(payload)
      }
      setCellDialogOpen(false)
      const res = await timetableApi.get(classId, sectionId)
      setTimetable(res.data?.data || [])
      toast.success(editEntryId ? 'Entry updated' : 'Entry added')
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save entry'
      toast.error(msg)
    }
  }

  const handleDeleteEntry = async (id: number) => {
    try {
      await timetableApi.delete(String(id))
      const res = await timetableApi.get(classId, sectionId)
      setTimetable(res.data?.data || [])
      toast.success('Entry removed')
    } catch { toast.error('Failed to delete entry') }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Timetable</Typography>
        {isAdminUser && classId && sectionId && (
          <Button variant="outlined" startIcon={<Settings />} onClick={() => setPeriodDialogOpen(true)}>
            Configure Periods
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 180 }} disabled={isStudent}>
          <InputLabel>Class</InputLabel>
          <Select value={classId} label="Class" onChange={(e) => { setClassId(e.target.value); setSectionId('') }}>
            {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }} disabled={!classId || isStudent}>
          <InputLabel>Section</InputLabel>
          <Select value={sectionId} label="Section" onChange={(e) => setSectionId(e.target.value)}>
            {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Paper>

      {!classId || !sectionId ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Select a class and section to view timetable</Typography>
        </Paper>
      ) : loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <Paper sx={{ overflowX: 'auto' }}>
          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Period</TableCell>
                  {DAYS.map(day => (
                    <TableCell key={day} sx={{ fontWeight: 700, textAlign: 'center' }}>{DAY_LABELS[day]}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">No periods configured.</Typography>
                    </TableCell>
                  </TableRow>
                ) : periods.map(period => (
                  <TableRow key={period.id}>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                      <Typography variant="body2" fontWeight={600}>{period.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {period.startTime} – {period.endTime}
                      </Typography>
                    </TableCell>
                    {DAYS.map(day => {
                      const entry = getEntry(day, period)
                      return (
                        <TableCell
                          key={`${day}-${period.id}`}
                          sx={{
                            textAlign: 'center', p: 0.5, minWidth: 140,
                            cursor: isAdminUser ? 'pointer' : 'default',
                            '&:hover': isAdminUser ? { bgcolor: 'action.hover' } : {},
                          }}
                          onClick={() => {
                            if (!isAdminUser) return
                            if (entry) openEditCell(day, period, entry)
                            else openAddCell(day, period)
                          }}
                        >
                          {entry ? (
                            <Box>
                              <Typography variant="body2" fontWeight={600} fontSize={12}>{entry.subject}</Typography>
                              <Typography variant="caption" display="block" color="text.secondary" fontSize={11}>{entry.teacher}</Typography>
                              <Typography variant="caption" display="block" color="text.secondary" fontSize={11}>Room: {entry.room || '-'}</Typography>
                              {isAdminUser && (
                                <Box mt={0.3}>
                                  <IconButton size="small" onClick={e => { e.stopPropagation(); openEditCell(day, period, entry) }}>
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); handleDeleteEntry(entry.id) }}>
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              {isAdminUser ? 'Click to add' : '-'}
                            </Typography>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={periodDialogOpen} onClose={() => setPeriodDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configure Periods</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            {periods.map((p, idx) => (
              <Box key={p.id} display="flex" gap={1} alignItems="center">
                <Typography sx={{ minWidth: 30, fontWeight: 600 }}>{p.label}</Typography>
                <TextField size="small" label="Start" type="time" value={p.startTime}
                  onChange={e => { const u = [...periods]; u[idx] = { ...u[idx], startTime: e.target.value }; savePeriods(u) }}
                  InputLabelProps={{ shrink: true }} />
                <TextField size="small" label="End" type="time" value={p.endTime}
                  onChange={e => { const u = [...periods]; u[idx] = { ...u[idx], endTime: e.target.value }; savePeriods(u) }}
                  InputLabelProps={{ shrink: true }} />
                <IconButton color="error" onClick={() => savePeriods(periods.filter((_, i) => i !== idx))}>
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<Add />} variant="outlined" onClick={() => {
              const n = periods.length + 1
              savePeriods([...periods, { id: `P${n}`, label: `P${n}`, startTime: '', endTime: '' }])
            }}>
              Add Period
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPeriodDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cellDialogOpen} onClose={() => setCellDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editEntryId ? 'Edit Entry' : 'Add Entry'}
          {selectedCell && (
            <Typography variant="caption" display="block" color="text.secondary">
              {DAY_LABELS[selectedCell.day]} &middot; {selectedCell.period.label} ({selectedCell.period.startTime}–{selectedCell.period.endTime})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <FormControl size="small" fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select value={entryForm.subjectId} label="Subject" onChange={e => setEntryForm(f => ({ ...f, subjectId: e.target.value }))}>
                {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Teacher</InputLabel>
              <Select value={entryForm.teacherId} label="Teacher" onChange={e => setEntryForm(f => ({ ...f, teacherId: e.target.value }))}>
                {teachers.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Room" value={entryForm.room}
              onChange={e => setEntryForm(f => ({ ...f, room: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCellDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCellSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
