import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
import { useAuth } from '@/context/AuthContext'
import { isTeacher, isAdmin } from '@/utils/helpers'
import api from '@/api/axios'
import CreateHomeworkDialog from './CreateHomeworkDialog'

const CreateHomeworkPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [teacherId, setTeacherId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) { setLoading(false); setError('Not logged in'); return }
    if (!isTeacher(user.role) && !isAdmin(user.role)) {
      setLoading(false)
      setError('Only teachers can create homework')
      return
    }
    api.get(`/teachers/user/${user.id}`)
      .then(r => {
        const tData = r.data?.data || r.data
        if (tData?.id) setTeacherId(String(tData.id))
        else setError('No teacher record found for your account')
      })
      .catch(() => setError('Could not load teacher profile. Please contact admin.'))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return null

  if (error) {
    return (
      <Box textAlign="center" py={8}>
        <Typography color="error" mb={2}>{error}</Typography>
        <Button variant="outlined" onClick={() => navigate('/homework')}>Back to Homework</Button>
      </Box>
    )
  }

  return (
    <CreateHomeworkDialog
      open={true}
      teacherId={teacherId}
      onClose={() => navigate('/homework')}
      onSuccess={() => navigate('/homework')}
    />
  )
}

export default CreateHomeworkPage
