import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Paper, Typography, Grid, Button, Chip, Divider,
} from '@mui/material'
import { ArrowBack, Person } from '@mui/icons-material'
import api from '@/api/axios'

interface SubjectData {
  id: number; name: string; code: string; description?: string; active: boolean; teacherNames?: string[];
}

export default function SubjectDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [subject, setSubject] = useState<SubjectData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get(`/subjects/${id}`).then(r => {
      setSubject(r.data?.data || r.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return <Box textAlign="center" py={4}><Typography>Loading...</Typography></Box>
  if (!subject) return <Box textAlign="center" py={4}><Typography color="error">Subject not found</Typography></Box>

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/subjects')} sx={{ mb: 2 }}>
        Back to Subjects
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="h5" fontWeight={700}>{subject.name}</Typography>
              <Chip label={subject.active ? 'Active' : 'Inactive'} size="small" color={subject.active ? 'success' : 'default'} />
            </Box>
            <Divider />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Subject Code</Typography>
            <Typography variant="body2" fontWeight={500}>{subject.code}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Description</Typography>
            <Typography variant="body2" fontWeight={500}>{subject.description || '-'}</Typography>
          </Grid>
        </Grid>

        {subject.teacherNames && subject.teacherNames.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>Teachers</Typography>
            <Box display="flex" flexDirection="column" gap={0.5}>
              {subject.teacherNames.map((t, i) => (
                <Box key={i} display="flex" alignItems="center" gap={1}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="body2">{t}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  )
}
