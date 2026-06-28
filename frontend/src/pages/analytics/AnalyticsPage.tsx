import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem,
  TextField,
} from '@mui/material'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import StatCard from '@/components/common/StatCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { analyticsApi } from '@/api/analytics.api'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AnalyticsPage() {
  const [year] = useState(new Date().getFullYear())
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [loading, setLoading] = useState(true)

  const [schoolData, setSchoolData] = useState<Record<string, unknown>>({})
  const [attendanceTrends, setAttendanceTrends] = useState<Record<string, unknown>[]>([])
  const [subjectPerformance, setSubjectPerformance] = useState<Record<string, unknown>[]>([])
  const [homeworkTrends, setHomeworkTrends] = useState<Record<string, unknown>[]>([])

  const fetchSchoolData = useCallback(async () => {
    try {
      const res = await analyticsApi.getSchoolPerformance(year)
      setSchoolData(res.data.data || {})
    } catch { /* ignore */ }
  }, [year])

  const fetchClassData = useCallback(async () => {
    if (!classId) return
    try {
      const [attRes, hwRes] = await Promise.all([
        analyticsApi.getAttendanceTrends(classId, sectionId || undefined, year),
        analyticsApi.getHomeworkCompletionTrends(classId, year),
      ])
      const attData = attRes.data.data as Record<string, unknown> || {}
      const hwData = hwRes.data.data as Record<string, unknown> || {}
      setAttendanceTrends((attData.monthlyTrends || []) as Record<string, unknown>[])
      setHomeworkTrends((hwData.monthlyTrends || []) as Record<string, unknown>[])
    } catch { /* ignore */ }
  }, [classId, sectionId, year])

  const fetchSubjectData = useCallback(async () => {
    if (!classId || !subjectId) {
      setSubjectPerformance([])
      return
    }
    try {
      const res = await analyticsApi.getSubjectPerformance(classId, subjectId)
      const data = res.data.data as Record<string, unknown> || {}
      setSubjectPerformance((data.testPerformances || []) as Record<string, unknown>[])
    } catch { /* ignore */ }
  }, [classId, subjectId])

  useEffect(() => { fetchSchoolData() }, [fetchSchoolData])
  useEffect(() => { fetchClassData() }, [fetchClassData])
  useEffect(() => { fetchSubjectData() }, [fetchSubjectData])
  useEffect(() => { setLoading(false) }, [])

  const totalStudents = (schoolData.totalStudents as number) || 0
  const totalTeachers = (schoolData.totalTeachers as number) || 0
  const overallAvg = (schoolData.overallAverage as number) || 0
  const genderRatio = (schoolData.genderRatio as Record<string, number>) || { male: 0, female: 0 }

  const attendanceTrendChart = {
    labels: attendanceTrends.map((t) => {
      const m = t.month as number
      return MONTHS[m - 1] || ''
    }),
    datasets: [{
      label: 'Attendance %',
      data: attendanceTrends.map((t) => t.percentage as number),
      borderColor: '#1976D2', tension: 0.4, fill: false,
    }],
  }

  const homeworkCompletionChart = {
    labels: homeworkTrends.map((t) => {
      const m = t.month as number
      return MONTHS[m - 1] || ''
    }),
    datasets: [{
      label: 'Completion %',
      data: homeworkTrends.map((t) => t.completionRate as number),
      borderColor: '#388E3C', tension: 0.4, fill: false,
    }],
  }

  const subjectChart = {
    labels: subjectPerformance.map((t) => (t.testName as string) || ''),
    datasets: [
      {
        label: 'Average',
        data: subjectPerformance.map((t) => t.averageScore as number),
        backgroundColor: '#1976D2',
      },
      {
        label: 'Highest',
        data: subjectPerformance.map((t) => t.highestScore as number),
        backgroundColor: '#FFA726',
      },
    ],
  }

  const genderChart = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: [genderRatio.male || 0, genderRatio.female || 0],
      backgroundColor: ['#1976D2', '#E91E63'],
    }],
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Analytics</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField fullWidth type="number" size="small" label="Year" value={year} disabled />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select value={classId} label="Class" onChange={(e) => setClassId(e.target.value)}>
                <MenuItem value="">School Overview</MenuItem>
                <MenuItem value="1">Class 10</MenuItem>
                <MenuItem value="2">Class 9</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Section</InputLabel>
              <Select value={sectionId} label="Section" onChange={(e) => setSectionId(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="1">A</MenuItem>
                <MenuItem value="2">B</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Subject</InputLabel>
              <Select value={subjectId} label="Subject" onChange={(e) => setSubjectId(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="1">Mathematics</MenuItem>
                <MenuItem value="2">Science</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading ? <LoadingSpinner /> : (
        <>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard label="Total Students" value={totalStudents} color="#1976D2" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard label="Total Teachers" value={totalTeachers} color="#388E3C" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard label="Avg Attendance" value={attendanceTrends.length > 0 ? `${Math.round((attendanceTrends.reduce((s, t) => s + (t.percentage as number), 0) / attendanceTrends.length))}%` : 'N/A'} color="#FFA726" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard label="Pass Rate" value={overallAvg ? `${Math.round(overallAvg)}%` : 'N/A'} color="#7B1FA2" />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>Attendance Trends</Typography>
                {attendanceTrends.length > 0 ? (
                  <Box sx={{ height: 250 }}>
                    <Line data={attendanceTrendChart} options={{ responsive: true, maintainAspectRatio: false }} />
                  </Box>
                ) : (
                  <Typography color="text.secondary" align="center" py={4}>Select a class to view attendance trends</Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>Subject Performance</Typography>
                {subjectPerformance.length > 0 ? (
                  <Box sx={{ height: 250 }}>
                    <Bar data={subjectChart} options={{ responsive: true, maintainAspectRatio: false }} />
                  </Box>
                ) : (
                  <Typography color="text.secondary" align="center" py={4}>Select a class and subject to view performance</Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>Homework Completion</Typography>
                {homeworkTrends.length > 0 ? (
                  <Box sx={{ height: 250 }}>
                    <Line data={homeworkCompletionChart} options={{ responsive: true, maintainAspectRatio: false }} />
                  </Box>
                ) : (
                  <Typography color="text.secondary" align="center" py={4}>Select a class to view homework trends</Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>Class Performance</Typography>
                <Typography color="text.secondary" align="center" py={4}>Select a class to view comparison</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>Gender Ratio</Typography>
                <Box sx={{ maxWidth: 250, height: 250, mx: 'auto' }}>
                  {(genderRatio.male || genderRatio.female) ? (
                    <Doughnut data={genderChart} options={{ responsive: true, maintainAspectRatio: false }} />
                  ) : (
                    <Typography color="text.secondary" align="center" py={4}>No data</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}
