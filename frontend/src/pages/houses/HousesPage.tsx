import { useState } from 'react'
import {
  Box, Paper, Typography, Grid, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar,
} from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const houses = [
  { id: '1', name: 'Ruby House', color: '#D32F2F', motto: 'Strength and Courage', points: 1250, memberCount: 120, leaderName: 'Alice Johnson' },
  { id: '2', name: 'Emerald House', color: '#388E3C', motto: 'Wisdom and Growth', points: 1120, memberCount: 115, leaderName: 'Bob Smith' },
  { id: '3', name: 'Sapphire House', color: '#1976D2', motto: 'Truth and Honor', points: 1080, memberCount: 118, leaderName: 'Charlie Brown' },
  { id: '4', name: 'Amber House', color: '#FFA726', motto: 'Creativity and Joy', points: 980, memberCount: 112, leaderName: 'Diana Prince' },
]

const sortedHouses = [...houses].sort((a, b) => b.points - a.points)
const members = [
  { id: '1', name: 'Alice Johnson', house: 'Ruby House', class: '10-A', role: 'Captain' },
  { id: '2', name: 'Eve Wilson', house: 'Ruby House', class: '9-B', role: 'Member' },
  { id: '3', name: 'Frank Miller', house: 'Ruby House', class: '8-A', role: 'Vice Captain' },
]

export default function HousesPage() {
  const [loading] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState('1')

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>School Houses</Typography>

      {loading ? <LoadingSpinner /> : (
        <Box>
          <Grid container spacing={3} mb={4}>
            {houses.map((h) => (
              <Grid key={h.id} item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    borderTop: 4,
                    borderColor: h.color,
                    cursor: 'pointer',
                    ...(selectedHouse === h.id ? { boxShadow: `0 0 0 2px ${h.color}` } : {}),
                  }}
                  onClick={() => setSelectedHouse(h.id)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Avatar sx={{ bgcolor: h.color, width: 32, height: 32, fontSize: 16, fontWeight: 700 }}>
                        {h.name.charAt(0)}
                      </Avatar>
                      <Typography variant="h6" fontWeight={700}>{h.name}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" fontStyle="italic" mb={1}>
                      "{h.motto}"
                    </Typography>
                    <Typography variant="body2"><strong>Points:</strong> {h.points}</Typography>
                    <Typography variant="body2"><strong>Members:</strong> {h.memberCount}</Typography>
                    <Typography variant="body2"><strong>Leader:</strong> {h.leaderName}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>House Leaderboard</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>House</TableCell>
                    <TableCell>Points</TableCell>
                    <TableCell>Members</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedHouses.map((h, i) => (
                    <TableRow key={h.id}>
                      <TableCell>
                        <Chip
                          size="small"
                          icon={i < 3 ? <EmojiEvents /> : undefined}
                          label={`#${i + 1}`}
                          color={i === 0 ? 'warning' : i === 1 ? 'default' : i === 2 ? 'info' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ bgcolor: h.color, width: 24, height: 24, fontSize: 12 }}>{h.name.charAt(0)}</Avatar>
                          {h.name}
                        </Box>
                      </TableCell>
                      <TableCell>{h.points}</TableCell>
                      <TableCell>{h.memberCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Members - {houses.find((h) => h.id === selectedHouse)?.name}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.name}</TableCell>
                      <TableCell>{m.class}</TableCell>
                      <TableCell><Chip size="small" label={m.role} color={m.role === 'Captain' ? 'warning' : m.role === 'Vice Captain' ? 'info' : 'default'} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
    </Box>
  )
}
