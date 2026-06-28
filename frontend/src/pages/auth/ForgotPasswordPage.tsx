import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert } from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import { toast } from 'react-toastify'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Please enter your email'); return }
    setLoading(true)
    setError('')
    try {
      await new Promise((r) => setTimeout(r, 1000))
      setSent(true)
      toast.success('Reset link sent to your email')
    } catch {
      setError('Failed to send reset email. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" bgcolor="background.default" px={2}>
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <SchoolIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={700}>Forgot Password</Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your email to receive a reset link
            </Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {sent ? (
            <Alert severity="success">
              Password reset link has been sent to <strong>{email}</strong>. Please check your inbox.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth label="Email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} margin="normal" required autoFocus
              />
              <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3, mb: 2 }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </Box>
          )}
          <Box textAlign="center" mt={2}>
            <Link component={RouterLink} to="/login" variant="body2">Back to Login</Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
