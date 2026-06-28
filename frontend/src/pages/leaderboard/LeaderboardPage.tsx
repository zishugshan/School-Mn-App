import { useState } from 'react'
import {
  Box, Paper, Typography, Tabs, Tab, Grid, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Avatar,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material'
import { EmojiEvents, WorkspacePremium } from '@mui/icons-material'


const allEntries = [
  { rank: 1, studentId: '1', studentName: 'Alice Johnson', className: '10-A', score: 98, badge: 'gold' as const },
  { rank: 2, studentId: '2', studentName: 'Bob Smith', className: '10-A', score: 95, badge: 'silver' as const },
  { rank: 3, studentId: '3', studentName: 'Charlie Brown', className: '10-B', score: 92, badge: 'bronze' as const },
  { rank: 4, studentId: '4', studentName: 'Diana Prince', className: '9-A', score: 89 },
  { rank: 5, studentId: '5', studentName: 'Eve Wilson', className: '9-A', score: 87 },
  { rank: 6, studentId: '6', studentName: 'Frank Miller', className: '10-B', score: 85 },
  { rank: 7, studentId: '7', studentName: 'Grace Lee', className: '8-A', score: 83 },
  { rank: 8, studentId: '8', studentName: 'Henry Davis', className: '8-B', score: 80 },
  { rank: 9, studentId: '9', studentName: 'Ivy Chen', className: '9-B', score: 78 },
  { rank: 10, studentId: '10', studentName: 'Jack Thompson', className: '10-A', score: 76 },
]

const badgeColors = { gold: '#FFA726', silver: '#90A4AE', bronze: '#8D6E63' }

export default function LeaderboardPage() {
  const [tab, setTab] = useState(0)
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [year, setYear] = useState('2026')
  const [month, setMonth] = useState('6')
  const [scope, setScope] = useState<'school' | 'class'>('school')

  const top3 = allEntries.slice(0, 3)
  const rest = allEntries.slice(3)

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Leaderboard</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center" mb={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
                <MenuItem value="2026">2026</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={String(i + 1)}>
                    {new Date(2026, i).toLocaleString('default', { month: 'long' })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <ToggleButtonGroup value={period} exclusive onChange={(_, v) => v && setPeriod(v)} size="small">
              <ToggleButton value="monthly">Monthly</ToggleButton>
              <ToggleButton value="yearly">Yearly</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} sm={3}>
            <ToggleButtonGroup value={scope} exclusive onChange={(_, v) => v && setScope(v)} size="small">
              <ToggleButton value="school">School-wide</ToggleButton>
              <ToggleButton value="class">Class-wise</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Attendance" />
          <Tab label="Homework" />
          <Tab label="Academics" />
        </Tabs>

        {/* Top 3 */}
        <Box display="flex" justifyContent="center" gap={4} mb={4} py={3}>
          {top3.map((entry) => (
            <Box key={entry.rank} textAlign="center">
              <Avatar
                sx={{
                  width: entry.rank === 1 ? 80 : 64,
                  height: entry.rank === 1 ? 80 : 64,
                  mx: 'auto',
                  bgcolor: badgeColors[entry.badge!] || 'primary.main',
                  fontSize: entry.rank === 1 ? 32 : 24,
                }}
              >
                {entry.rank === 1 ? <WorkspacePremium /> : <EmojiEvents />}
              </Avatar>
              <Typography variant="subtitle1" fontWeight={700} mt={1}>{entry.studentName}</Typography>
              <Typography variant="body2" color="text.secondary">{entry.className}</Typography>
              <Chip
                label={`#${entry.rank} - ${entry.score} pts`}
                size="small"
                sx={{ bgcolor: badgeColors[entry.badge!], color: '#fff', mt: 1 }}
              />
            </Box>
          ))}
        </Box>

        {/* Full table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rest.map((entry) => (
                <TableRow key={entry.studentId}>
                  <TableCell>
                    <Chip size="small" label={`#${entry.rank}`} color="default" />
                  </TableCell>
                  <TableCell>{entry.studentName}</TableCell>
                  <TableCell>{entry.className}</TableCell>
                  <TableCell>{entry.score} pts</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}
