import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Paper, Typography, Grid, Button, TextField, MenuItem,
} from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import { toast } from 'react-toastify'
import api from '@/api/axios'
import { teachersApi } from '@/api/teachers.api'

export default function TeacherFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    qualification: '', dateOfBirth: '', gender: 'MALE',
    phone: '', address: '',
  })

  useEffect(() => {
    if (!id) return
    api.get(`/teachers/${id}`).then(r => {
      const d = r.data?.data || r.data
      setForm({
        firstName: d.firstName || '', lastName: d.lastName || '',
        email: d.email || '', password: '',
        qualification: d.qualification || '', dateOfBirth: d.dateOfBirth || '',
        gender: d.gender || 'MALE', phone: d.phone || '', address: d.address || '',
      })
    }).catch(() => toast.error('Failed to load teacher')).finally(() => setLoading(false))
  }, [id])

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.qualification || !form.dateOfBirth) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      if (isEdit && id) {
        await teachersApi.update(id, { ...form, dateOfBirth: form.dateOfBirth } as any)
        toast.success('Teacher updated successfully')
      } else {
        await api.post('/auth/register', {
          email: form.email, password: form.password || 'password123',
          firstName: form.firstName, lastName: form.lastName,
          phone: form.phone, role: 'TEACHER',
        })
        toast.success('Teacher registered successfully')
      }
      navigate('/teachers')
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Operation failed'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Box textAlign="center" py={4}><Typography>Loading...</Typography></Box>

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/teachers')} sx={{ mb: 2 }}>
        Back to Teachers
      </Button>

      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <Typography variant="h5" fontWeight={700} mb={3}>
          {isEdit ? 'Edit Teacher' : 'Add New Teacher'}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="First Name" value={form.firstName} onChange={handleChange('firstName')} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Last Name" value={form.lastName} onChange={handleChange('lastName')} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email" type="email" value={form.email} onChange={handleChange('email')} required />
          </Grid>
          {!isEdit && (
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Password" type="password" value={form.password} onChange={handleChange('password')} helperText="Leave empty for default password" />
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Qualification" value={form.qualification} onChange={handleChange('qualification')} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Date of Birth" type="date" value={form.dateOfBirth}
              onChange={handleChange('dateOfBirth')} InputLabelProps={{ shrink: true }} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Gender" select value={form.gender} onChange={handleChange('gender')}>
              <MenuItem value="MALE">Male</MenuItem>
              <MenuItem value="FEMALE">Female</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Phone" value={form.phone} onChange={handleChange('phone')} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Address" multiline rows={2} value={form.address} onChange={handleChange('address')} />
          </Grid>
        </Grid>

        <Box mt={3} display="flex" gap={2}>
          <Button variant="contained" startIcon={<Save />} onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/teachers')}>Cancel</Button>
        </Box>
      </Paper>
    </Box>
  )
}
