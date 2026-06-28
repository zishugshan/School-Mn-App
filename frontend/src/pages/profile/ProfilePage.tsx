import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Avatar, Chip, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableRow, Card, CardContent,
} from '@mui/material'
import { Edit, PhotoCamera } from '@mui/icons-material'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import api from '@/api/axios'

export default function ProfilePage() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(`${user?.firstName || ''} ${user?.lastName || ''}`.trim())
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState('+1-555-0100')
  const [studentData, setStudentData] = useState<{ className: string; sectionName: string; studentCode: string } | null>(null)

  useEffect(() => {
    if (user?.role === 'STUDENT' && user?.id) {
      api.get(`/students/user/${user.id}`).then(r => {
        const d = r.data?.data || r.data
        setStudentData(d)
      }).catch(() => {})
    }
  }, [user])

  const roleInfo: Record<string, { label: string; color: 'error' | 'primary' | 'secondary' | 'info' }> = {
    SUPER_ADMIN: { label: 'Super Admin', color: 'error' as const },
    SCHOOL_ADMIN: { label: 'School Admin', color: 'error' as const },
    TEACHER: { label: 'Teacher', color: 'primary' as const },
    STUDENT: { label: 'Student', color: 'secondary' as const },
    PARENT: { label: 'Parent', color: 'info' as const },
  }

  const role: string = user?.role || 'STUDENT'

  const handleSave = () => {
    setEditing(false)
    toast.success('Profile updated')
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Profile</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN' ? 'error.main' : role === 'TEACHER' ? 'primary.main' : 'secondary.main', fontSize: 40 }}>
                {name?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="h5" fontWeight={700}>{name}</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>{email}</Typography>
              <Chip label={roleInfo[role]?.label || role} color={roleInfo[role]?.color || 'default'} />
              <Box mt={2}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditing(!editing)}
                  fullWidth
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Box>
              <Box mt={1}>
                <Button variant="outlined" startIcon={<PhotoCamera />} component="label" fullWidth>
                  Change Photo
                  <input type="file" hidden accept="image/*" />
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>Personal Information</Typography>
              {editing ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" onClick={handleSave}>Save Changes</Button>
                  </Grid>
                </Grid>
              ) : (
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: 180 }}>Full Name</TableCell>
                        <TableCell>{name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                        <TableCell>{email}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                        <TableCell>{phone}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                        <TableCell><Chip label={roleInfo[role]?.label || role} color={roleInfo[role]?.color || 'default'} size="small" /></TableCell>
                      </TableRow>
                      {role === 'STUDENT' && (
                        <>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                            <TableCell>{studentData ? `${studentData.className?.replace('Class ', '') || ''} ${studentData.sectionName || ''}` : '-'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Student Code</TableCell>
                            <TableCell>{studentData?.studentCode || '-'}</TableCell>
                          </TableRow>
                        </>
                      )}
                      {role === 'TEACHER' && (
                        <>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Employee Code</TableCell>
                            <TableCell>TCH-2020-042</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Subjects</TableCell>
                            <TableCell>Mathematics, Physics</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Classes</TableCell>
                            <TableCell>10-A, 10-B, 9-A</TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
