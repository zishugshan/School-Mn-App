import { useState } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Tabs, Tab,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import EmptyState from '@/components/common/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { isStudent } from '@/utils/helpers'


const eventsList = [
  { id: '1', title: 'Annual Sports Day', description: 'Inter-house sports competitions', date: '2026-07-20', type: 'sports' as const, house: 'All', participants: ['Student'], registeredStudents: ['s1', 's2'], location: 'School Ground' },
  { id: '2', title: 'Science Exhibition', description: 'Student science projects display', date: '2026-08-15', type: 'academic' as const, house: 'All', participants: ['Student'], registeredStudents: ['s1'], location: 'Science Lab' },
  { id: '3', title: 'Parent-Teacher Meet', description: 'Annual PTM for Class 10', date: '2026-06-20', type: 'meeting' as const, house: 'All', participants: ['Teacher', 'Parent'], registeredStudents: [], location: 'Auditorium' },
]

const typeColors: Record<string, 'primary' | 'secondary' | 'info' | 'warning' | 'default'> = {
  sports: 'primary', cultural: 'secondary', academic: 'info', meeting: 'warning', other: 'default',
}

export default function EventsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [registering, setRegistering] = useState<string | null>(null)
  const isStudentUser = isStudent(user?.role || '')

  const filtered = tab === 0 ? eventsList : eventsList.filter((e) => new Date(e.date) < new Date())

  const handleRegister = async (eventId: string) => {
    setRegistering(eventId)
    try {
      await new Promise((r) => setTimeout(r, 500))
      toast.success('Registered for event')
    } catch {
      toast.error('Failed to register')
    } finally {
      setRegistering(null)
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Events</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
          Create Event
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Upcoming" />
        <Tab label="Past Events" />
      </Tabs>

      {filtered.length === 0 ? <EmptyState message="No events found" /> : (
        <Grid container spacing={3}>
          {filtered.map((e) => (
            <Grid key={e.id} item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" fontWeight={600}>{e.title}</Typography>
                    <Chip size="small" label={e.type} color={typeColors[e.type]} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>{e.description}</Typography>
                  <Typography variant="body2"><strong>Date:</strong> {e.date}</Typography>
                  <Typography variant="body2"><strong>Location:</strong> {e.location}</Typography>
                  <Typography variant="body2"><strong>House:</strong> {e.house}</Typography>
                </CardContent>
                <CardActions>
                  {isStudentUser && (
                    <Button
                      size="small"
                      variant="contained"
                      disabled={registering === e.id}
                      onClick={() => handleRegister(e.id)}
                    >
                      {registering === e.id ? 'Registering...' : 'Register'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Event Title" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select label="Type">
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="cultural">Cultural</MenuItem>
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="meeting">Meeting</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Location" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success('Event created'); setDialogOpen(false) }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
