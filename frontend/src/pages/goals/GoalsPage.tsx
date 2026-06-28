import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button,
  LinearProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import { Add, CheckCircle, TrendingUp, Delete } from '@mui/icons-material'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { toast } from 'react-toastify'
import { goalsApi, type CreateGoalPayload, type CreateSelfGoalPayload } from '@/api/goals.api'
import { useAuth } from '@/context/AuthContext'
import api from '@/api/axios'
import type { Goal } from '@/types'

const categoryColors: Record<string, 'primary' | 'secondary' | 'info' | 'warning'> = {
  academic: 'primary', reading: 'secondary', attendance: 'info', extracurricular: 'warning',
}

interface ClassItem { id: string; name: string }

export default function GoalsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<Goal[]>([])
  const [classDialogOpen, setClassDialogOpen] = useState(false)
  const [selfDialogOpen, setSelfDialogOpen] = useState(false)
  const [progressDialog, setProgressDialog] = useState<{ open: boolean; goalId: string; current: number; target: number }>({ open: false, goalId: '', current: 0, target: 0 })
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [studentId, setStudentId] = useState<string | null>(null)

  const isStudent = user?.role === 'STUDENT'
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'SUPER_ADMIN' || user?.role === 'SCHOOL_ADMIN'

  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formTargetValue, setFormTargetValue] = useState('')
  const [formUnit, setFormUnit] = useState('')
  const [formDeadline, setFormDeadline] = useState('')
  const [formCategory, setFormCategory] = useState('academic')
  const [formClassId, setFormClassId] = useState('')
  const [formStudentCode, setFormStudentCode] = useState('')

  useEffect(() => {
    if (!user?.id) return
    if (isStudent) {
      api.get(`/students/user/${user.id}`).then(r => {
        const data = r.data.data || r.data
        setStudentId(String(data.id))
      }).catch(() => {})
    }
  }, [user?.id, isStudent])

  const fetchGoals = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const selfRes = await goalsApi.getUserGoals(String(user.id))
      let allGoals: Goal[] = selfRes.data.data || []

      if (isStudent && studentId) {
        const studentRes = await goalsApi.getStudentGoals(studentId)
        const studentGoals = studentRes.data.data || []
        const existingIds = new Set(allGoals.map(g => g.id))
        for (const g of studentGoals) {
          if (!existingIds.has(g.id)) {
            allGoals.push(g)
          }
        }
      }

      setGoals(allGoals)
    } catch { toast.error('Failed to load goals') }
    finally { setLoading(false) }
  }, [user?.id, isStudent, studentId])

  useEffect(() => {
    if (isStudent && !studentId) return
    if (!user?.id) return
    fetchGoals()
  }, [fetchGoals, isStudent, studentId, user?.id])

  useEffect(() => {
    if (isTeacher) {
      api.get('/classes').then(r => setClasses(r.data?.data || [])).catch(() => {})
    }
  }, [isTeacher])

  const handleCreate = async () => {
    if (!formTitle || !formTargetValue || !formClassId) {
      toast.error('Please fill in required fields')
      return
    }
    try {
      const payload: CreateGoalPayload = {
        classId: Number(formClassId),
        title: formTitle,
        description: formDescription,
        targetValue: Number(formTargetValue),
        unit: formUnit,
        category: formCategory,
      }
      if (formStudentCode.trim()) {
        payload.studentCode = formStudentCode.trim()
      }
      await goalsApi.create(payload)
      toast.success('Goal(s) created successfully')
      setClassDialogOpen(false)
      resetForm()
      fetchGoals()
    } catch { toast.error('Failed to create goal') }
  }

  const handleSelfCreate = async () => {
    if (!formTitle || !formTargetValue) {
      toast.error('Please fill in required fields')
      return
    }
    try {
      const payload: CreateSelfGoalPayload = {
        title: formTitle,
        description: formDescription,
        targetValue: Number(formTargetValue),
        unit: formUnit,
        category: formCategory,
        targetDate: formDeadline || undefined,
      }
      await goalsApi.createSelf(payload)
      toast.success('Goal created successfully')
      setSelfDialogOpen(false)
      resetForm()
      fetchGoals()
    } catch { toast.error('Failed to create goal') }
  }

  const resetForm = () => {
    setFormTitle('')
    setFormDescription('')
    setFormTargetValue('')
    setFormUnit('')
    setFormDeadline('')
    setFormCategory('academic')
    setFormClassId('')
    setFormStudentCode('')
  }

  const handleUpdateProgress = async () => {
    try {
      await goalsApi.updateProgress(progressDialog.goalId, progressDialog.current)
      toast.success('Progress updated')
      setProgressDialog({ ...progressDialog, open: false })
      fetchGoals()
    } catch { toast.error('Failed to update progress') }
  }

  const handleComplete = async (id: string) => {
    try {
      await goalsApi.markComplete(id)
      toast.success('Goal completed!')
      fetchGoals()
    } catch { toast.error('Failed to complete goal') }
  }

  const handleDelete = async (id: string) => {
    try {
      await goalsApi.delete(id)
      toast.success('Goal deleted')
      fetchGoals()
    } catch { toast.error('Failed to delete goal') }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Goals</Typography>
        <Box display="flex" gap={1}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setSelfDialogOpen(true)}>
            Create Goal
          </Button>
          {isTeacher && (
            <Button variant="outlined" startIcon={<Add />} onClick={() => setClassDialogOpen(true)}>
              Create for Class
            </Button>
          )}
        </Box>
      </Box>

      {loading ? <LoadingSpinner /> : goals.length === 0 ? (
        <EmptyState message="No goals yet. Create your first goal!"
          actionLabel="Create Goal" onAction={() => setSelfDialogOpen(true)} />
      ) : (
        <Grid container spacing={3}>
          {goals.map((g) => {
            const progress = g.targetValue > 0 ? (g.currentProgress / g.targetValue) * 100 : 0
            const isCompleted = g.status === 'COMPLETED' || g.currentProgress >= g.targetValue
            return (
              <Grid key={g.id} item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" fontWeight={600}>{g.title}</Typography>
                      <Chip size="small" label={isCompleted ? 'completed' : 'active'} color={isCompleted ? 'success' : 'primary'} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>{g.description}</Typography>
                    <Typography variant="body2" mb={1}>
                      <strong>Progress:</strong> {g.currentProgress}/{g.targetValue} {g.unit || ''}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progress, 100)}
                      color={isCompleted ? 'success' : 'primary'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Chip size="small" label={g.category} color={categoryColors[g.category] || 'default'} />
                      <Typography variant="caption" color="text.secondary">
                        Due: {g.targetDate ? new Date(g.targetDate).toLocaleDateString() : 'No deadline'}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    {!isCompleted && (
                      <>
                        <Button size="small" startIcon={<TrendingUp />}
                          onClick={() => setProgressDialog({ open: true, goalId: g.id, current: g.currentProgress, target: g.targetValue })}>
                          Update
                        </Button>
                        <Button size="small" color="success" startIcon={<CheckCircle />}
                          onClick={() => handleComplete(g.id)}>
                          Complete
                        </Button>
                      </>
                    )}
                    <Box flexGrow={1} />
                    <Button size="small" color="error" startIcon={<Delete />}
                      onClick={() => {
                        if (window.confirm('Delete this goal?')) {
                          handleDelete(g.id)
                        }
                      }}>
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Self-create dialog for all users */}
      <Dialog open={selfDialogOpen} onClose={() => setSelfDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Goal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" required value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="number" label="Target Value" required value={formTargetValue}
                onChange={(e) => setFormTargetValue(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Unit (e.g., %, books)" value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Deadline" value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={formCategory} label="Category" onChange={(e) => setFormCategory(e.target.value)}>
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="reading">Reading</MenuItem>
                  <MenuItem value="attendance">Attendance</MenuItem>
                  <MenuItem value="extracurricular">Extra-curricular</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelfDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSelfCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Admin create-for-class dialog (teachers/admins only) */}
      {isTeacher && (
        <Dialog open={classDialogOpen} onClose={() => setClassDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Goal for Class</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField fullWidth label="Title" required value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Description" multiline rows={2} value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="number" label="Target Value" required value={formTargetValue}
                  onChange={(e) => setFormTargetValue(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Unit (e.g., %, books)" value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select value={formCategory} label="Category" onChange={(e) => setFormCategory(e.target.value)}>
                    <MenuItem value="academic">Academic</MenuItem>
                    <MenuItem value="reading">Reading</MenuItem>
                    <MenuItem value="attendance">Attendance</MenuItem>
                    <MenuItem value="extracurricular">Extra-curricular</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Class</InputLabel>
                  <Select value={formClassId} label="Class" onChange={(e) => setFormClassId(e.target.value)}>
                    {classes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Roll Number (optional)" value={formStudentCode}
                  onChange={(e) => setFormStudentCode(e.target.value)}
                  helperText="Leave empty to assign to all students in the class" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClassDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreate}>Create</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Progress update dialog for all users */}
      <Dialog open={progressDialog.open} onClose={() => setProgressDialog({ ...progressDialog, open: false })} maxWidth="xs" fullWidth>
        <DialogTitle>Update Progress</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth type="number" label="Current Value" sx={{ mt: 2 }}
            value={progressDialog.current}
            onChange={(e) => setProgressDialog({ ...progressDialog, current: Number(e.target.value) })}
            inputProps={{ min: 0, max: progressDialog.target }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressDialog({ ...progressDialog, open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateProgress}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
