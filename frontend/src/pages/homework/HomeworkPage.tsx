import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, CircularProgress, Popover, List, ListItem, ListItemText,
} from '@mui/material'
import { Add, Refresh } from '@mui/icons-material'
import CreateHomeworkDialog from './CreateHomeworkDialog'
import { useAuth } from '@/context/AuthContext'
import { isTeacher, isAdmin } from '@/utils/helpers'
import api from '@/api/axios'

interface HomeworkRow {
  id: string; title: string; subjectName: string; className: string; maxScore: number;
  dueDate: string; submittedStudentNames: string[]; doubts: string[];
}

export default function HomeworkPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [homeworkData, setHomeworkData] = useState<HomeworkRow[]>([])
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null)
  const [popoverNames, setPopoverNames] = useState<string[]>([])
  const [popoverTitle, setPopoverTitle] = useState('')
  const isTeacherUser = isTeacher(user?.role || '') || isAdmin(user?.role || '')

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    api.get(`/teachers/user/${user.id}`).then(r => {
      const id = String((r.data.data || r.data).id)
      setTeacherId(id)
      loadHomeworkData(id)
    }).catch(() => {
      setTeacherId(null)
      setLoading(false)
    })
  }, [user?.id])

  const canCreate = teacherId !== null

  const loadHomeworkData = useCallback(async (tId: string) => {
    try {
      const hwRes = await api.get(`/homework/teacher/${tId}`)
      const hwList = (hwRes.data?.data || []) as any[]
      const enriched = await Promise.all(hwList.map(async (hw: any) => {
        try {
          const [subRes, doubtRes] = await Promise.all([
            api.get(`/homework/submissions/homework/${hw.id}`),
            api.get(`/homework/${hw.id}/doubts`).catch(() => ({ data: { data: [] } })),
          ])
          const subs: any[] = subRes.data?.data || []
          const doubts: any[] = doubtRes.data?.data || []
          return {
            id: hw.id, title: hw.title, subjectName: hw.subjectName || '-',
            className: hw.targetClasses?.[0] || '-', maxScore: hw.maxScore,
            dueDate: hw.dueDate,
            submittedStudentNames: subs.map((s: any) => s.studentName).filter(Boolean),
            doubts: doubts.map((d: any) => `${d.senderName}: ${d.message}`),
          } as HomeworkRow
        } catch {
          return { id: hw.id, title: hw.title, subjectName: hw.subjectName || '-',
            className: hw.targetClasses?.[0] || '-', maxScore: hw.maxScore,
            dueDate: hw.dueDate, submittedStudentNames: [], doubts: [] } as HomeworkRow
        }
      }))
      setHomeworkData(enriched)
    } catch {
      setHomeworkData([])
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Homework</Typography>
        <Box display="flex" gap={1}>
          {isTeacherUser && (
            <>
              <Button variant="outlined" startIcon={<Refresh />} onClick={() => teacherId && loadHomeworkData(teacherId)}>
                Refresh
              </Button>
              <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)} disabled={!canCreate}>
                Create Homework
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Paper>
        {homeworkData.length === 0 ? (
          <Box py={6} textAlign="center" color="text.secondary">No homework found. Create one to get started.</Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Max Score</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Submitted Students</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Doubts</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {homeworkData.map((h) => {
                  const isOverdue = new Date(h.dueDate) < new Date()
                  return (
                    <TableRow key={h.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/homework/${h.id}`)}>
                      <TableCell>{h.title}</TableCell>
                      <TableCell>{h.subjectName || '-'}</TableCell>
                      <TableCell>{h.className}</TableCell>
                      <TableCell>{h.maxScore ?? '-'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color={isOverdue ? 'error.main' : 'text.primary'}>
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
      </Paper>

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

      <CreateHomeworkDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        teacherId={teacherId || ''}
        onSuccess={() => teacherId && loadHomeworkData(teacherId)}
      />
    </Box>
  )
}
