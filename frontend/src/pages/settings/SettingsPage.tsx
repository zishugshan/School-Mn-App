import { useState } from 'react'
import {
  Box, Typography, Grid, TextField, Button, Avatar, Switch,
  FormControlLabel, Card, CardContent,
} from '@mui/material'
import { PhotoCamera } from '@mui/icons-material'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'

export default function SettingsPage() {
  const { user } = useAuth()
  const [name, setName] = useState(`${user?.firstName || ''} ${user?.lastName || ''}`.trim())
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState('+1-555-0100')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyPush, setNotifyPush] = useState(true)
  const [notifySms, setNotifySms] = useState(false)

  const handleProfileUpdate = () => {
    toast.success('Profile updated successfully')
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    toast.success('Password changed successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleNotificationSave = () => {
    toast.success('Notification preferences saved')
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Settings</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>Profile Settings</Typography>
              <Box display="flex" alignItems="center" gap={3} mb={3}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
                  {name?.charAt(0) || 'U'}
                </Avatar>
                <Button variant="outlined" startIcon={<PhotoCamera />} component="label">
                  Change Photo
                  <input type="file" hidden accept="image/*" />
                </Button>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" onClick={handleProfileUpdate}>Save Changes</Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>Change Password</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth type="password" label="Current Password" value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth type="password" label="New Password" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth type="password" label="Confirm New Password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" onClick={handlePasswordChange}>Change Password</Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>Notification Preferences</Typography>
              <FormControlLabel
                control={<Switch checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />}
                label="Email Notifications"
              />
              <FormControlLabel
                control={<Switch checked={notifyPush} onChange={(e) => setNotifyPush(e.target.checked)} />}
                label="Push Notifications"
              />
              <FormControlLabel
                control={<Switch checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} />}
                label="SMS Notifications"
              />
              <Box mt={2}>
                <Button variant="contained" onClick={handleNotificationSave}>Save Preferences</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
