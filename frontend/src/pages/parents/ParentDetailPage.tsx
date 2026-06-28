import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Paper, Typography, Grid, Button, Chip, Card, CardContent, Divider,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import api from '@/api/axios'

interface StudentChild {
  id: number; firstName: string; lastName: string;
  className?: string; studentCode?: string;
}

interface ParentData {
  id: number; parentName?: string;
  email?: string; phone?: string; occupation?: string;
  address?: string; relationship?: string;
  status?: string; studentIds?: number[];
}

export default function ParentDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [parent, setParent] = useState<ParentData | null>(null)
  const [children, setChildren] = useState<StudentChild[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get(`/parents/${id}`).then(r => setParent(r.data?.data || r.data)).catch(() => {}),
      api.get(`/parents/${id}/students`).then(r => setChildren(r.data?.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [id])

  if (loading) return <Box textAlign="center" py={4}><Typography>Loading...</Typography></Box>
  if (!parent) return <Box textAlign="center" py={4}><Typography color="error">Parent not found</Typography></Box>

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/parents')} sx={{ mb: 2 }}>
        Back to Parents
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="h5" fontWeight={700}>{parent.parentName || `Parent #${parent.id}`}</Typography>
              <Chip label={parent.status === 'active' ? 'Active' : 'Inactive'} size="small" color={parent.status === 'active' ? 'success' : 'default'} />
            </Box>
            <Divider />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography variant="body2" fontWeight={500}>{parent.email || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Phone</Typography>
            <Typography variant="body2" fontWeight={500}>{parent.phone || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Occupation</Typography>
            <Typography variant="body2" fontWeight={500}>{parent.occupation || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Relationship</Typography>
            <Typography variant="body2" fontWeight={500}>{parent.relationship || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">Address</Typography>
            <Typography variant="body2" fontWeight={500}>{parent.address || '-'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {parent.studentIds && parent.studentIds.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Children ({parent.studentIds.length})</Typography>
          <Grid container spacing={2}>
            {children.length > 0 ? children.map((s) => (
              <Grid item xs={12} sm={6} md={4} key={s.id}>
                <Card variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/students/${s.id}`)}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {s.firstName} {s.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.className || s.studentCode || 'Student'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )) : parent.studentIds.map((sid) => (
              <Grid item xs={12} sm={6} md={4} key={sid}>
                <Card variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/students/${sid}`)}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Student #{sid}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  )
}
