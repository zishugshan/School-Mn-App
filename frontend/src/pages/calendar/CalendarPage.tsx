import { useState } from 'react'
import {
  Box, Paper, Typography, Grid, Chip, IconButton, List, ListItem, ListItemText,
} from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const events: Record<number, { title: string; type: 'event' | 'holiday' | 'exam' | 'meeting' }[]> = {
  5: [{ title: 'School Holiday', type: 'holiday' }],
  12: [{ title: 'Math Exam', type: 'exam' }],
  15: [{ title: 'Science Exam', type: 'exam' }],
  20: [{ title: 'PT Meeting', type: 'meeting' }],
  25: [{ title: 'Sports Day', type: 'event' }],
}

const typeColors: Record<string, 'primary' | 'success' | 'error' | 'info'> = {
  event: 'primary', holiday: 'success', exam: 'error', meeting: 'info',
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1))
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const selectedEvents = selectedDay ? events[selectedDay] || [] : []

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Calendar</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <IconButton onClick={prevMonth}><ChevronLeft /></IconButton>
              <Typography variant="h6" fontWeight={600}>{monthName}</Typography>
              <IconButton onClick={nextMonth}><ChevronRight /></IconButton>
            </Box>

            <Grid container spacing={0.5}>
              {dayNames.map((d) => (
                <Grid key={d} item xs={12 / 7 }>
                  <Typography variant="caption" fontWeight={700} textAlign="center" display="block" py={1}>
                    {d}
                  </Typography>
                </Grid>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <Grid key={`empty-${i}`} item xs={12 / 7 } />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayEvents = events[day] || []
                const hasEvent = dayEvents.length > 0
                const isSelected = selectedDay === day
                return (
                  <Grid key={day} item xs={12 / 7 }>
                    <Paper
                      onClick={() => setSelectedDay(day)}
                      sx={{
                        p: 0.5, textAlign: 'center', cursor: 'pointer', minHeight: 60,
                        bgcolor: isSelected ? 'primary.light' : hasEvent ? `${typeColors[dayEvents[0].type]}.light` : 'grey.50',
                        color: isSelected ? '#fff' : 'text.primary',
                        '&:hover': { bgcolor: isSelected ? 'primary.main' : 'grey.200' },
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>{day}</Typography>
                      {hasEvent && (
                        <Chip
                          size="small"
                          label={dayEvents[0].title.substring(0, 8)}
                          color={typeColors[dayEvents[0].type]}
                          sx={{ height: 18, fontSize: 10, mt: 0.5 }}
                        />
                      )}
                    </Paper>
                  </Grid>
                )
              })}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              {selectedDay ? `Events on ${monthName} ${selectedDay}` : 'Select a day'}
            </Typography>
            {selectedEvents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No events on this day</Typography>
            ) : (
              <List dense>
                {selectedEvents.map((e, i) => (
                  <ListItem key={i} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1 }}>
                    <ListItemText
                      primary={e.title}
                      secondary={e.type}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Chip size="small" label={e.type} color={typeColors[e.type]} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
