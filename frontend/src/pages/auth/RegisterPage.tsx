import { useState, useEffect } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography, Link,
  InputAdornment, IconButton, Alert, MenuItem,
} from '@mui/material'
import { Visibility, VisibilityOff, School } from '@mui/icons-material'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { getClasses } from '@/api/attendance.api'

const ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']

interface ClassOption { id: string; name: string }

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '', role: '' })
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (form.role === 'STUDENT') {
      getClasses().then(r => setClasses(r.data.data || [])).catch(() => {})
    } else {
      setClasses([])
      setClassId('')
      setSectionId('')
    }
  }, [form.role])

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      setError('Please fill in all required fields')
      return
    }
    if (form.role === 'STUDENT' && (!classId || !sectionId)) {
      setError('Please select a class and section')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data: import('../../types').RegisterRequest = {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        role: form.role as import('../../types').UserRole,
      }
      if (form.role === 'STUDENT') {
        data.classId = classId
        data.sectionId = sectionId
      }
      await register(data)
      toast.success('Registration successful! Please sign in.')
      navigate('/login')
    } catch (err) {
      console.error('Registration error:', err)
      setError('Registration failed. The email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" bgcolor="background.default" px={2}>
      <Card sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <School sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={700}>School Management</Typography>
            <Typography variant="body2" color="text.secondary">Create a new account</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="First Name" value={form.firstName} onChange={handleChange('firstName')} margin="normal" required autoFocus />
            <TextField fullWidth label="Last Name" value={form.lastName} onChange={handleChange('lastName')} margin="normal" required />
            <TextField fullWidth label="Email" type="email" value={form.email} onChange={handleChange('email')} margin="normal" required />
            <TextField
              fullWidth label="Password" type={showPassword ? 'text' : 'password'}
              value={form.password} onChange={handleChange('password')} margin="normal" required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField fullWidth label="Phone" value={form.phone} onChange={handleChange('phone')} margin="normal" />
            <TextField fullWidth select label="Role" value={form.role} onChange={handleChange('role')} margin="normal">
              {ROLES.map((r) => <MenuItem key={r} value={r}>{r.replace('_', ' ')}</MenuItem>)}
            </TextField>
            {form.role === 'STUDENT' && (
              <>
                <TextField fullWidth select label="Class" value={classId} onChange={(e) => { setClassId(e.target.value) }} margin="normal">
                  {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>
                <TextField fullWidth label="Section (A, B, C...)" value={sectionId} onChange={(e) => setSectionId(e.target.value)} margin="normal" disabled={!classId} placeholder="e.g. A" />
              </>
            )}
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3, mb: 2 }}>
              {loading ? 'Registering...' : 'Sign Up'}
            </Button>
            <Box textAlign="center">
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login">Sign in</Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}