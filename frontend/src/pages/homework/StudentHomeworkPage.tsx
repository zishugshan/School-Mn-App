import { useState, useEffect, useCallback } from 'react'

import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, List, ListItem, ListItemText,
  Avatar, CircularProgress,
} from '@mui/material'
import { CheckCircle, QuestionAnswer, Send, Close } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { homeworkApi } from '@/api/homework.api'
import api from '@/api/axios'
import type { Homework, HomeworkSubmission, HomeworkDoubt } from '@/types'

const STATUS_MAP: Record<string, { label: string; color: 'default' | 'info' | 'success' | 'error' | 'warning' }> = {
  NOT_SUBMITTED: { label: 'Not Submitted', color: 'default' },
  SUBMITTED: { label: 'Submitted', color: 'info' },
  COMPLETED: { label: 'Completed', color: 'success' },
  OVERDUE: { label: 'Overdue', color: 'error' },
}

interface HomeworkWithStatus extends Homework {
  submissionStatus: string
  submission?: HomeworkSubmission
}

export default function StudentHomeworkPage() {
  const { user } = useAuth()
  const [studentId, setStudentId] = useState<string | null>(null)
  const [homeworkList, setHomeworkList] = useState<HomeworkWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)

  // Doubt dialog state
  const [doubtHomework, setDoubtHomework] = useState<HomeworkWithStatus | null>(null)
  const [doubts, setDoubts] = useState<HomeworkDoubt[]>([])
  const [doubtMsg, setDoubtMsg] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null)
  const [loadingDoubts, setLoadingDoubts] = useState(false)
  const [sendingDoubt, setSendingDoubt] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    api.get(`/students/user/${user.id}`).then(r => {
      const data = r.data.data || r.data
      setStudentId(String(data.id))
    }).catch(() => setStudentId(null))
  }, [user?.id])

  useEffect(() => {
    if (!studentId) return
    Promise.all([
      homeworkApi.getByStudent(studentId),
      homeworkApi.getSubmissionsByStudent(studentId),
    ]).then(([hwRes, subRes]) => {
      const hwList: Homework[] = (hwRes.data?.data || []) as Homework[]
      const subs: HomeworkSubmission[] = (subRes.data?.data || []) as HomeworkSubmission[]

      const merged: HomeworkWithStatus[] = hwList.map(hw => {
        const sub = subs.find(s => String(s.homeworkId) === String(hw.id))
        let status = 'NOT_SUBMITTED'
        if (sub) {
          if (sub.status === 'COMPLETED') status = 'COMPLETED'
          else if (sub.status === 'SUBMITTED') status = 'SUBMITTED'
          else status = sub.status
        } else if (new Date(hw.dueDate) < new Date()) {
          status = 'OVERDUE'
        }
        return { ...hw, submissionStatus: status, submission: sub }
      })

      merged.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      setHomeworkList(merged)
    }).catch(() => toast.error('Failed to load homework'))
      .finally(() => setLoading(false))
  }, [studentId])

  const handleMarkDone = async (hw: HomeworkWithStatus) => {
    if (!studentId) return
    setSubmitting(hw.id)
    try {
      await homeworkApi.submit({ homeworkId: hw.id, studentId, submissionText: 'Marked as done' })
      toast.success('Homework marked as done!')
      setHomeworkList(prev => prev.map(h =>
        h.id === hw.id
          ? { ...h, submissionStatus: 'SUBMITTED', submission: { id: '', homeworkId: hw.id, studentId, status: 'SUBMITTED' } }
          : h
      ))
    } catch {
      toast.error('Failed to mark as done')
    } finally {
      setSubmitting(null)
    }
  }

  const openDoubtDialog = useCallback(async (hw: HomeworkWithStatus) => {
    setDoubtHomework(hw)
    setReplyTo(null)
    setDoubtMsg('')
    setLoadingDoubts(true)
    try {
      const res = await homeworkApi.getDoubts(hw.id)
      setDoubts((res.data?.data || []) as HomeworkDoubt[])
    } catch {
      setDoubts([])
    } finally {
      setLoadingDoubts(false)
    }
  }, [])

  const handleSendDoubt = async () => {
    if (!doubtHomework || !doubtMsg.trim() || !user?.id) return
    setSendingDoubt(true)
    try {
      await homeworkApi.createDoubt(doubtHomework.id, {
        senderId: user.id,
        message: doubtMsg.trim(),
        parentDoubtId: replyTo?.id,
      })
      setDoubtMsg('')
      setReplyTo(null)
      const res = await homeworkApi.getDoubts(doubtHomework.id)
      setDoubts((res.data?.data || []) as HomeworkDoubt[])
    } catch {
      toast.error('Failed to send doubt')
    } finally {
      setSendingDoubt(false)
    }
  }

  const handleResolve = async (doubtId: string) => {
    try {
      await homeworkApi.resolveDoubt(doubtId)
      setDoubts(prev => prev.map(d =>
        d.id === doubtId ? { ...d, isResolved: true } : d
      ))
    } catch {
      toast.error('Failed to resolve doubt')
    }
  }

  if (loading) return <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>My Homework</Typography>

      {homeworkList.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No homework assigned yet.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Teacher</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Max Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {homeworkList.map(hw => {
                const st = STATUS_MAP[hw.submissionStatus] || STATUS_MAP.NOT_SUBMITTED
                const isOverdue = hw.submissionStatus === 'OVERDUE'
                const canMark = hw.submissionStatus === 'NOT_SUBMITTED' || isOverdue
                return (
                  <TableRow key={hw.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{hw.subjectName || '-'}</Typography>
                    </TableCell>
                    <TableCell>{hw.title}</TableCell>
                    <TableCell>{hw.teacherName || '-'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color={isOverdue ? 'error' : 'text.primary'}>
                        {new Date(hw.dueDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{hw.maxScore ?? '-'}</TableCell>
                    <TableCell>
                      <Chip label={st.label} size="small" color={st.color} />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        {canMark && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleMarkDone(hw)}
                            disabled={submitting === hw.id}
                            sx={{ fontSize: '0.7rem', py: 0.25, minWidth: 100 }}
                          >
                            {submitting === hw.id ? '...' : 'Mark Done'}
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<QuestionAnswer />}
                          onClick={() => openDoubtDialog(hw)}
                          sx={{ fontSize: '0.7rem', py: 0.25, minWidth: 80 }}
                        >
                          Doubts
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Doubt Chat Dialog */}
      <Dialog open={!!doubtHomework} onClose={() => setDoubtHomework(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Doubts — {doubtHomework?.title}
            </Typography>
            <IconButton size="small" onClick={() => setDoubtHomework(null)}><Close /></IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {doubtHomework?.subjectName} • {doubtHomework?.teacherName}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 400, minHeight: 250, overflowY: 'auto' }}>
          {loadingDoubts ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
          ) : doubts.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No doubts yet. Ask your first doubt below!
            </Typography>
          ) : (
            <List disablePadding>
              {doubts.map(d => (
                <Box key={d.id}>
                  <ListItem alignItems="flex-start" disableGutters sx={{ bgcolor: d.senderRole === 'TEACHER' ? 'action.hover' : 'transparent', borderRadius: 1, mb: 0.5, px: 1 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: d.senderRole === 'TEACHER' ? 'primary.main' : 'success.main' }}>
                            {d.senderName.charAt(0)}
                          </Avatar>
                          <Typography variant="caption" fontWeight={700}>{d.senderName}</Typography>
                          <Chip label={d.senderRole} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />
                          {d.isResolved && <Chip label="Resolved" size="small" color="success" sx={{ height: 18, fontSize: '0.6rem' }} />}
                        </Box>
                      }
                      secondary={
                        <Box mt={0.5}>
                          <Typography variant="body2">{d.message}</Typography>
                          <Box display="flex" gap={1} mt={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(d.createdAt).toLocaleString()}
                            </Typography>
                            {!d.isResolved && (
                              <>
                                <Button size="small" sx={{ fontSize: '0.65rem', minWidth: 0, p: 0 }} onClick={() => setReplyTo({ id: d.id, name: d.senderName })}>
                                  Reply
                                </Button>
                                {d.senderRole === 'STUDENT' && (
                                  <Button size="small" sx={{ fontSize: '0.65rem', minWidth: 0, p: 0, color: 'success.main' }} onClick={() => handleResolve(d.id)}>
                                    Resolve
                                  </Button>
                                )}
                              </>
                            )}
                          </Box>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                  {d.replies?.map(r => (
                    <ListItem key={r.id} alignItems="flex-start" disableGutters sx={{ ml: 4, bgcolor: r.senderRole === 'TEACHER' ? 'action.hover' : 'transparent', borderRadius: 1, mb: 0.5, px: 1 }}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: r.senderRole === 'TEACHER' ? 'primary.main' : 'success.main' }}>
                              {r.senderName.charAt(0)}
                            </Avatar>
                            <Typography variant="caption" fontWeight={700}>{r.senderName}</Typography>
                            <Chip label={r.senderRole} size="small" variant="outlined" sx={{ height: 16, fontSize: '0.55rem' }} />
                          </Box>
                        }
                        secondary={
                          <Box mt={0.5}>
                            <Typography variant="body2">{r.message}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(r.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  ))}
                </Box>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: 'column', alignItems: 'stretch' }}>
          {replyTo && (
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="caption" color="primary">
                Replying to {replyTo.name}
              </Typography>
              <IconButton size="small" onClick={() => setReplyTo(null)}><Close fontSize="small" /></IconButton>
            </Box>
          )}
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              size="small"
              placeholder={replyTo ? 'Write a reply...' : 'Type your doubt here...'}
              value={doubtMsg}
              onChange={e => setDoubtMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendDoubt() } }}
              multiline
              maxRows={3}
            />
            <Button
              variant="contained"
              onClick={handleSendDoubt}
              disabled={!doubtMsg.trim() || sendingDoubt}
              sx={{ minWidth: 80 }}
            >
              {sendingDoubt ? <CircularProgress size={18} /> : <Send />}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
