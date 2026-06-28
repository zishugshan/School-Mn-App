import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Paper, Typography, Grid, Button, Chip, Avatar, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, OutlinedInput, Checkbox, ListItemText,
} from '@mui/material'
import { ArrowBack, Edit, Add } from '@mui/icons-material'
import { toast } from 'react-toastify'
import api from '@/api/axios'
import { useAuth } from '@/context/AuthContext'
import { isAdmin } from '@/utils/helpers'

interface TeacherData {
  id: number; firstName: string; lastName: string; email: string;
  teacherCode: string; qualification?: string; dateOfBirth?: string;
  gender: string; address?: string; phone?: string; dateJoined?: string;
  subjects?: string[]; profilePhoto?: string; active: boolean;
}

interface SubjectOption { id: string; name: string }

export default function TeacherDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [teacher, setTeacher] = useState<TeacherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [assignedClasses, setAssignedClasses] = useState<any[]>([])
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [allClasses, setAllClasses] = useState<any[]>([])
  const [allSections, setAllSections] = useState<any[]>([])
  const [assignForm, setAssignForm] = useState({ classId: '', sectionId: '' })
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false)
  const [allSubjects, setAllSubjects] = useState<SubjectOption[]>([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get(`/teachers/${id}`).then(r => setTeacher(r.data?.data || r.data)),
      api.get('/classes').then(r => setAllClasses(r.data?.data || [])),
      api.get('/subjects').then(r => {
        const data = r.data?.data || r.data || []
        setAllSubjects(Array.isArray(data) ? data.map((s: any) => ({ id: String(s.id), name: s.name })) : [])
      }),
    ]).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    api.get(`/teachers/${id}/classes`).then(r => {
      const data = r.data?.data || []
      setAssignedClasses(Array.isArray(data) ? data : [])
    }).catch(() => {})
  }, [id])

  useEffect(() => {
    if (!assignForm.classId) { setAllSections([]); return }
    api.get(`/classes/${assignForm.classId}/sections`).then(r => {
      const data = r.data?.data || []
      setAllSections(Array.isArray(data) ? data.map((s: any) => ({ id: String(s.id), name: s.name })) : [])
    }).catch(() => setAllSections([]))
  }, [assignForm.classId])

  const handleAssign = async () => {
    if (!assignForm.classId || !assignForm.sectionId || !id) return
    try {
      await api.post(`/classes/${assignForm.classId}/sections/${assignForm.sectionId}/teachers/${id}`)
      setAssignDialogOpen(false)
      setAssignForm({ classId: '', sectionId: '' })
      const res = await api.get(`/teachers/${id}/classes`)
      setAssignedClasses(res.data?.data || [])
      toast.success('Class assigned successfully')
    } catch { toast.error('Failed to assign class') }
  }

  const openSubjectDialog = () => {
    if (!teacher?.subjects) return
    const ids = allSubjects.filter(s => teacher.subjects?.includes(s.name)).map(s => s.id)
    setSelectedSubjectIds(ids)
    setSubjectDialogOpen(true)
  }

  const handleSubjectsSave = async () => {
    if (!teacher) return
    const currentIds = allSubjects.filter(s => teacher.subjects?.includes(s.name)).map(s => s.id)
    const toAdd = selectedSubjectIds.filter(id => !currentIds.includes(id))
    const toRemove = currentIds.filter(id => !selectedSubjectIds.includes(id))
    try {
      for (const sid of toAdd) await api.post(`/teachers/${teacher.id}/subjects/${sid}`)
      for (const sid of toRemove) await api.delete(`/teachers/${teacher.id}/subjects/${sid}`)
      setSubjectDialogOpen(false)
      const res = await api.get(`/teachers/${teacher.id}`)
      setTeacher(res.data?.data || res.data)
      toast.success('Subjects updated')
    } catch { toast.error('Failed to update subjects') }
  }

  if (loading) return <Box textAlign="center" py={4}><Typography>Loading...</Typography></Box>
  if (!teacher) return <Box textAlign="center" py={4}><Typography color="error">Teacher not found</Typography></Box>

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/teachers')} sx={{ mb: 2 }}>
        Back to Teachers
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{ width: 100, height: 100, fontSize: 40, mb: 1, bgcolor: 'primary.main' }}>
              {teacher.firstName?.[0]}{teacher.lastName?.[0]}
            </Avatar>
            <Typography variant="h6" fontWeight={700}>{teacher.firstName} {teacher.lastName}</Typography>
            <Chip label={teacher.active ? 'Active' : 'Inactive'} size="small" color={teacher.active ? 'success' : 'default'} sx={{ mt: 1 }} />
          </Grid>
          <Grid item xs={12} md={9}>
            <Typography variant="h5" fontWeight={700} mb={2}>Teacher Details</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <InfoItem label="Teacher Code" value={teacher.teacherCode} />
              <InfoItem label="Email" value={teacher.email} />
              <InfoItem label="Phone" value={teacher.phone || '-'} />
              <InfoItem label="Qualification" value={teacher.qualification || '-'} />
              <InfoItem label="Gender" value={teacher.gender} />
              <InfoItem label="Date of Birth" value={teacher.dateOfBirth || '-'} />
              <InfoItem label="Date Joined" value={teacher.dateJoined || '-'} />
              <InfoItem label="Address" value={teacher.address || '-'} />
            </Grid>
            <Box mt={2}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="subtitle2" color="text.secondary">Subjects</Typography>
                {isAdmin(user?.role || '') && (
                  <Button size="small" startIcon={<Add />} onClick={openSubjectDialog}>Manage</Button>
                )}
              </Box>
              {teacher.subjects && teacher.subjects.length > 0 ? (
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {teacher.subjects.map((s, i) => <Chip key={i} label={s} size="small" color="primary" variant="outlined" />)}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No subjects assigned</Typography>
              )}
            </Box>

            <Box mt={3}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="subtitle2" color="text.secondary">Assigned Classes / Sections</Typography>
                {isAdmin(user?.role || '') && (
                  <Button size="small" startIcon={<Add />} onClick={() => setAssignDialogOpen(true)}>Assign</Button>
                )}
              </Box>
              {assignedClasses.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No classes assigned</Typography>
              ) : (
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {assignedClasses.map((ac, i) => (
                    <Chip key={i} label={`${ac.className} - ${ac.sectionName}${ac.isClassTeacher ? ' (Class Teacher)' : ''}`}
                      size="small" color="primary" variant="outlined" />
                  ))}
                </Box>
              )}
            </Box>

            <Box mt={2}>
              <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/teachers/${id}/edit`)}>
                Edit Teacher
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={subjectDialogOpen} onClose={() => setSubjectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Subjects</DialogTitle>
        <DialogContent>
          <FormControl size="small" fullWidth sx={{ mt: 1 }}>
            <InputLabel>Subjects</InputLabel>
            <Select multiple value={selectedSubjectIds} onChange={e => setSelectedSubjectIds(e.target.value as string[])}
              input={<OutlinedInput label="Subjects" />}
              renderValue={ids => ids.map(id => allSubjects.find(s => s.id === id)?.name).join(', ')}>
              {allSubjects.map(s => (
                <MenuItem key={s.id} value={s.id}>
                  <Checkbox checked={selectedSubjectIds.includes(s.id)} />
                  <ListItemText primary={s.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubjectDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubjectsSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Class & Section</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <FormControl size="small" fullWidth>
              <InputLabel>Class</InputLabel>
              <Select value={assignForm.classId} label="Class"
                onChange={(e) => setAssignForm({ classId: e.target.value, sectionId: '' })}>
                {allClasses.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth disabled={!assignForm.classId}>
              <InputLabel>Section</InputLabel>
              <Select value={assignForm.sectionId} label="Section"
                onChange={(e) => setAssignForm(f => ({ ...f, sectionId: e.target.value }))}>
                {allSections.map((s: any) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign}>Assign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Grid>
  )
}
