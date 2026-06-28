import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Paper, Typography, Grid, Button, Chip, Divider,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import api from '@/api/axios'

interface SectionInfo {
  id: number; name: string;
}
interface ClassData {
  id: number; name: string; description?: string; sectionPrefix?: string;
  sections?: SectionInfo[]; subjects?: string[]; classTeacherName?: string; active: boolean;
}

export default function ClassDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [cls, setCls] = useState<ClassData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get(`/classes/${id}`).then(r => {
      setCls(r.data?.data || r.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return <Box textAlign="center" py={4}><Typography>Loading...</Typography></Box>
  if (!cls) return <Box textAlign="center" py={4}><Typography color="error">Class not found</Typography></Box>

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/classes')} sx={{ mb: 2 }}>
        Back to Classes
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="h5" fontWeight={700}>{cls.name}</Typography>
              <Chip label={cls.active ? 'Active' : 'Inactive'} size="small" color={cls.active ? 'success' : 'default'} />
            </Box>
            <Divider />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Class Teacher</Typography>
            <Typography variant="body2" fontWeight={500}>{cls.classTeacherName || 'Not assigned'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Description</Typography>
            <Typography variant="body2" fontWeight={500}>{cls.description || '-'}</Typography>
          </Grid>
          {cls.sections && cls.sections.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>Sections</Typography>
              <Box display="flex" gap={0.5} flexWrap="wrap">
                {cls.sections.map((s, i) => <Chip key={i} label={s.name} size="small" />)}
              </Box>
            </Grid>
          )}
          {cls.subjects && cls.subjects.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>Subjects</Typography>
              <Box display="flex" gap={0.5} flexWrap="wrap">
                {cls.subjects.map((s, i) => <Chip key={i} label={s} size="small" color="primary" variant="outlined" />)}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  )
}
