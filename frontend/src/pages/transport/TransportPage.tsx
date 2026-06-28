import { useState } from 'react'
import {
  Box, Paper, Typography, Grid, Card, CardContent,
  Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Tabs, Tab,
} from '@mui/material'
import { DirectionsBus } from '@mui/icons-material'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { isAdmin } from '@/utils/helpers'


const routes = [
  { id: '1', name: 'Route A - North Side', driverName: 'James Wilson', driverPhone: '+1-555-0101', vehicleNumber: 'SCH-101', capacity: 40, status: 'active' as const, stops: [
    { id: 's1', name: 'Main Street', address: '100 Main St', pickupTime: '7:00 AM', dropTime: '2:30 PM', fee: 50, order: 1 },
    { id: 's2', name: 'Oak Avenue', address: '200 Oak Ave', pickupTime: '7:15 AM', dropTime: '2:15 PM', fee: 50, order: 2 },
    { id: 's3', name: 'Pine Road', address: '50 Pine Rd', pickupTime: '7:30 AM', dropTime: '2:00 PM', fee: 50, order: 3 },
  ]},
  { id: '2', name: 'Route B - South Side', driverName: 'Maria Garcia', driverPhone: '+1-555-0102', vehicleNumber: 'SCH-102', capacity: 35, status: 'active' as const, stops: [] },
]

export default function TransportPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState(0)
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [assignDialog, setAssignDialog] = useState(false)
  const isAdminUser = isAdmin(user?.role || '')

  const route = routes.find((r) => r.id === selectedRoute)

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Transport</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Routes" />
        <Tab label="My Transport" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            {routes.map((r) => (
              <Card
                key={r.id}
                sx={{ mb: 2, cursor: 'pointer', border: selectedRoute === r.id ? 2 : 0, borderColor: 'primary.main' }}
                onClick={() => setSelectedRoute(r.id)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" fontWeight={600}>{r.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Driver: {r.driverName} | Vehicle: {r.vehicleNumber}
                      </Typography>
                    </Box>
                    <Chip size="small" label={r.status} color={r.status === 'active' ? 'success' : 'default'} />
                  </Box>
                  <Typography variant="body2" mt={1}>Capacity: {r.capacity} | Stops: {r.stops.length}</Typography>
                </CardContent>
              </Card>
            ))}
          </Grid>
          <Grid item xs={12} md={7}>
            {route ? (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>{route.name} - Route Details</Typography>
                <Typography variant="body2" mb={1}><strong>Driver:</strong> {route.driverName} ({route.driverPhone})</Typography>
                <Typography variant="body2" mb={2}><strong>Vehicle:</strong> {route.vehicleNumber}</Typography>
                {route.stops.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No stops defined</Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Order</TableCell>
                          <TableCell>Stop Name</TableCell>
                          <TableCell>Pickup Time</TableCell>
                          <TableCell>Drop Time</TableCell>
                          <TableCell>Fee</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {route.stops.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell>{s.order}</TableCell>
                            <TableCell>{s.name}</TableCell>
                            <TableCell>{s.pickupTime}</TableCell>
                            <TableCell>{s.dropTime}</TableCell>
                            <TableCell>${s.fee}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                {isAdminUser && (
                  <Box mt={2}>
                    <Button variant="contained" onClick={() => setAssignDialog(true)}>Assign Student</Button>
                  </Box>
                )}
              </Paper>
            ) : (
              <Paper sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">Select a route to view details</Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <DirectionsBus sx={{ fontSize: 48, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6">My Transport</Typography>
              <Typography variant="body2" color="text.secondary">Route A - North Side</Typography>
            </Box>
          </Box>
          <Typography><strong>Stop:</strong> Main Street (Pickup: 7:00 AM)</Typography>
          <Typography><strong>Drop:</strong> 2:30 PM</Typography>
          <Typography><strong>Monthly Fee:</strong> $50</Typography>
        </Paper>
      )}

      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Transport</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select label="Student">
                  <MenuItem value="1">John Doe</MenuItem>
                  <MenuItem value="2">Jane Smith</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Route</InputLabel>
                <Select label="Route">
                  {routes.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Stop</InputLabel>
                <Select label="Stop">
                  <MenuItem value="s1">Main Street</MenuItem>
                  <MenuItem value="s2">Oak Avenue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { toast.success('Transport assigned'); setAssignDialog(false) }}>Assign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
