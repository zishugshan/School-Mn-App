import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, TextField, InputAdornment, Popover, List, ListItem, ListItemText,
} from '@mui/material'
import { Add, Search } from '@mui/icons-material'
import { useAuth } from '@/context/AuthContext'
import { isTeacher, isAdmin } from '@/utils/helpers'
import api from '@/api/axios'

interface HomeworkRow {
  id: string; title: string; subjectName: string; teacherName?: string;
  targetClasses?: string[]; targetClassIds?: string[]; targetSectionNames?: string[]; targetSectionIds?: string[];
  className: string; dueDate: string; maxScore: number;
  submittedStudentNames: string[]; notSubmittedStudentNames: string[]; doubts: string[];
}

export default function HomeworkListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [homework, setHomework] = useState<HomeworkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null)
  const [popoverNames, setPopoverNames] = useState<string[]>([])
  const [popoverTitle, setPopoverTitle] = useState('')
  const isTeacherUser = isTeacher(user?.role || '') || isAdmin(user?.role || '')

  const fetchHomework = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    setLoading(true)
    try {
      if (isTeacherUser) {
        const tRes = await api.get(`/teachers/user/${user.id}`)
        const tData = tRes.data?.data || tRes.data
        if (!tData || !tData.id) { setHomework([]); return }
        const hwRes = await api.get(`/homework/teacher/${tData.id}`)
        const hwList = (hwRes.data?.data || []) as any[]
        const enriched = await Promise.all(hwList.map(async (hw: any) => {
          try {
            const [subRes, doubtRes] = await Promise.all([
              api.get(`/homework/submissions/homework/${hw.id}`),
              api.get(`/homework/${hw.id}/doubts`).catch(() => ({ data: { data: [] } })),
            ])
            const subs: any[] = subRes.data?.data || []
            const doubts: any[] = doubtRes.data?.data || []
            const submittedIds = new Set(subs.map((s: any) => String(s.studentId)).filter(Boolean))
            let notSubmittedNames: string[] = []
            const classIds: string[] = hw.targetClassIds || []
            const sectionIds: string[] = hw.targetSectionIds || []
            if (classIds.length > 0) {
              const cid = classIds[0]
              const studentsUrl = sectionIds.length > 0
                ? `/students/class/${cid}/section/${sectionIds[0]}`
                : `/students/class/${cid}`
              const allStudentsRes = await api.get(studentsUrl).catch(() => ({ data: { data: [] } }))
              const allStudents: any[] = allStudentsRes.data?.data || []
              notSubmittedNames = allStudents
                .filter((s: any) => !submittedIds.has(String(s.id)))
                .map((s: any) => `${s.firstName || ''} ${s.lastName || ''}`.trim())
                .filter(Boolean)
            }
            const sectionName = (hw.targetSectionNames?.[0]) || ''
            const className = sectionName
              ? `${(hw.targetClasses?.[0] || '').replace('Class ', '')}-${sectionName}`
              : (hw.targetClasses?.[0]) || '-'
            return {
              id: hw.id, title: hw.title, subjectName: hw.subjectName || '-',
              teacherName: hw.teacherName, targetClasses: hw.targetClasses, targetClassIds: hw.targetClassIds,
              targetSectionNames: hw.targetSectionNames, targetSectionIds: hw.targetSectionIds,
              className, dueDate: hw.dueDate, maxScore: hw.maxScore,
              submittedStudentNames: subs.map((s: any) => s.studentName).filter(Boolean),
              notSubmittedStudentNames: notSubmittedNames,
              doubts: doubts.map((d: any) => `${d.senderName}: ${d.message}`),
            } as HomeworkRow
          } catch {
            return { id: hw.id, title: hw.title, subjectName: hw.subjectName || '-',
              teacherName: hw.teacherName, targetClasses: hw.targetClasses, targetClassIds: hw.targetClassIds,
              dueDate: hw.dueDate, maxScore: hw.maxScore,
              submittedStudentNames: [], notSubmittedStudentNames: [], doubts: [] } as unknown as HomeworkRow
          }
        }))
        setHomework(enriched)
      } else {
        const sRes = await api.get(`/students/user/${user.id}`)
        const sData = sRes.data?.data || sRes.data
        if (!sData || !sData.id) { setHomework([]); return }
        const hwRes = await api.get(`/homework/student/${sData.id}`)
        const hwList = (hwRes.data?.data || []) as any[]
        const enriched = await Promise.all(hwList.map(async (hw: any) => {
          try {
            const doubtRes = await api.get(`/homework/${hw.id}/doubts`).catch(() => ({ data: { data: [] } }))
            const doubts: any[] = doubtRes.data?.data || []
            const sectionName = (hw.targetSectionNames?.[0]) || ''
            const className = sectionName
              ? `${(hw.targetClasses?.[0] || '').replace('Class ', '')}-${sectionName}`
              : (hw.targetClasses?.[0]) || '-'
            return {
              id: hw.id, title: hw.title, subjectName: hw.subjectName || '-',
              teacherName: hw.teacherName, targetClasses: hw.targetClasses,
              targetSectionNames: hw.targetSectionNames, targetSectionIds: hw.targetSectionIds,
              className, dueDate: hw.dueDate, maxScore: hw.maxScore,
              submittedStudentNames: [], notSubmittedStudentNames: [], doubts: doubts.map((d: any) => `${d.senderName}: ${d.message}`),
            } as HomeworkRow
          } catch {
            return { id: hw.id, title: hw.title, subjectName: hw.subjectName || '-',
              teacherName: hw.teacherName, targetClasses: hw.targetClasses,
              targetSectionNames: hw.targetSectionNames, targetSectionIds: hw.targetSectionIds,
              className: (hw.targetClasses?.[0]) || '-', dueDate: hw.dueDate, maxScore: hw.maxScore,
              submittedStudentNames: [], notSubmittedStudentNames: [], doubts: [] } as HomeworkRow
          }
        }))
        setHomework(enriched)
      }
    } catch {
      setHomework([])
    } finally {
      setLoading(false)
    }
  }, [user?.id, isTeacherUser])

  useEffect(() => { fetchHomework() }, [fetchHomework])

  const filtered = homework.filter(h =>
    !search || h.title.toLowerCase().includes(search.toLowerCase()) ||
    h.subjectName?.toLowerCase().includes(search.toLowerCase())
  )

  const isOverdue = (date: string) => new Date(date) < new Date()

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Homework</Typography>
        {isTeacherUser && (
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/homework/new')}>
            Create Homework
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          size="small" placeholder="Search homework..." value={search}
          onChange={(e) => setSearch(e.target.value)} fullWidth
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        />
      </Paper>

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Loading...</Typography></Paper>
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{search ? 'No homework matches your search.' : 'No homework found.'}</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Max Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Submitted Students</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Not Submitted</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Doubts</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((h) => {
                const overdue = isOverdue(h.dueDate)
                return (
                    <TableRow key={h.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/homework/${h.id}`)}>
                    <TableCell><Typography variant="body2" fontWeight={600}>{h.title}</Typography></TableCell>
                    <TableCell>{h.subjectName || '-'}</TableCell>
                    <TableCell>{h.className}</TableCell>
                    <TableCell>{h.maxScore ?? '-'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color={overdue ? 'error.main' : 'text.primary'}>
                        {new Date(h.dueDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {h.submittedStudentNames.length === 0 ? '-' : (
                        <Chip
                          size="small"
                          label={`${h.submittedStudentNames.length} submitted`}
                          color="success"
                          sx={{ height: 20, fontSize: '0.65rem', cursor: 'pointer' }}
                          onClick={(e) => { e.stopPropagation(); setPopoverAnchor(e.currentTarget); setPopoverNames(h.submittedStudentNames); setPopoverTitle('Submitted Students') }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {h.notSubmittedStudentNames.length === 0 ? '-' : (
                        <Chip
                          size="small"
                          label={`${h.notSubmittedStudentNames.length} pending`}
                          color="error"
                          sx={{ height: 20, fontSize: '0.65rem', cursor: 'pointer' }}
                          onClick={(e) => { e.stopPropagation(); setPopoverAnchor(e.currentTarget); setPopoverNames(h.notSubmittedStudentNames); setPopoverTitle('Not Submitted Students') }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {h.doubts.length === 0 ? '-' : (
                        <Chip
                          size="small"
                          label={`${h.doubts.length} doubt${h.doubts.length > 1 ? 's' : ''}`}
                          color="warning"
                          sx={{ height: 20, fontSize: '0.65rem', cursor: 'pointer' }}
                          onClick={(e) => { e.stopPropagation(); setPopoverAnchor(e.currentTarget); setPopoverNames(h.doubts); setPopoverTitle('Doubts') }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Popover
        open={!!popoverAnchor}
        anchorEl={popoverAnchor}
        onClose={() => setPopoverAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, pt: 1, fontWeight: 700 }}>{popoverTitle}</Typography>
        <List dense sx={{ maxHeight: 200, overflow: 'auto', minWidth: 160 }}>
          {popoverNames.map((name, i) => (
            <ListItem key={i}><ListItemText primary={name} primaryTypographyProps={{ variant: 'body2' }} /></ListItem>
          ))}
        </List>
      </Popover>
    </Box>
  )
}
