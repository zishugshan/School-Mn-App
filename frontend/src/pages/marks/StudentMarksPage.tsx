import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip,
} from '@mui/material'
import { School, TrendingUp, EmojiEvents, Assignment } from '@mui/icons-material'
import { useAuth } from '@/context/AuthContext'
import { marksApi } from '@/api/marks.api'
import api from '@/api/axios'
import StatCard from '@/components/common/StatCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { StudentMark } from '@/types'

function pct(obtained: number, total: number) { return total > 0 ? (obtained / total) * 100 : 0 }

function pctColor(p: number) {
  if (p >= 90) return '#4caf50'
  if (p >= 75) return '#2196f3'
  if (p >= 50) return '#ff9800'
  return '#f44336'
}

export default function StudentMarksPage() {
  const { user } = useAuth()
  const [studentId, setStudentId] = useState<string | null>(null)
  const [marks, setMarks] = useState<StudentMark[]>([])
  const [summary, setSummary] = useState<{ totalTests: number; overallAverage: number; highestScore: number; lowestScore: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    api.get(`/students/user/${user.id}`).then(r => {
      const data = r.data.data || r.data
      setStudentId(String(data.id))
    }).catch(() => setStudentId(null))
  }, [user?.id])

  useEffect(() => {
    if (!studentId) return
    setLoading(true)
    Promise.all([
      marksApi.getStudentMarks(studentId),
      marksApi.getStudentSummary(studentId),
    ]).then(([marksRes, summaryRes]) => {
      const marksData = marksRes.data.data || marksRes.data || []
      const summaryData = summaryRes.data.data || summaryRes.data || null
      setMarks(Array.isArray(marksData) ? marksData : [])
      setSummary(summaryData)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [studentId])

  if (loading) return <LoadingSpinner />

  const overallPct = summary?.overallAverage != null
    ? summary.overallAverage
    : (marks.length > 0 ? marks.reduce((s, m) => s + pct(m.marksObtained, m.maximumMarks), 0) / marks.length : 0)

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>My Marks</Typography>

      {summary && (
        <Grid container spacing={1.5} mb={2}>
          <Grid item xs={6} sm={3}>
            <StatCard label="Tests Taken" value={summary.totalTests} icon={<Assignment />} color="#1976D2" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Average %" value={`${overallPct.toFixed(1)}%`} icon={<School />} color="#388E3C" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Highest" value={summary.highestScore.toFixed(1)} icon={<EmojiEvents />} color="#FFA726" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Lowest" value={summary.lowestScore.toFixed(1)} icon={<TrendingUp />} color="#7B1FA2" />
          </Grid>
        </Grid>
      )}

      {marks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No marks recorded yet.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Test</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Marks</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Max</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">%</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {marks.map((m, i) => {
                const p = pct(m.marksObtained, m.maximumMarks)
                return (
                  <TableRow key={m.id} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{m.testName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{m.marksObtained.toFixed(1)}</TableCell>
                    <TableCell align="center">{m.maximumMarks.toFixed(1)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${p.toFixed(1)}%`}
                        size="small"
                        sx={{
                          bgcolor: pctColor(p),
                          color: '#fff',
                          fontWeight: 600,
                          minWidth: 56,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {m.remarks || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
