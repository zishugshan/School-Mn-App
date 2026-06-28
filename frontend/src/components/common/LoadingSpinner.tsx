import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

interface LoadingSpinnerProps {
  size?: number
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40 }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
      width="100%"
    >
      <CircularProgress size={size} />
    </Box>
  )
}

export default LoadingSpinner
