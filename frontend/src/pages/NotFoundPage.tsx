import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
import { Home } from '@mui/icons-material'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
      textAlign="center"
    >
      <Typography variant="h1" fontWeight={700} color="primary.main" sx={{ fontSize: 120 }}>
        404
      </Typography>
      <Typography variant="h5" color="text.secondary" mb={3}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        The page you are looking for does not exist or has been moved.
      </Typography>
      <Button variant="contained" startIcon={<Home />} size="large" onClick={() => navigate('/dashboard')}>
        Back to Home
      </Button>
    </Box>
  )
}
