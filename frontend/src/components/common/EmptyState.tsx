import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import InboxIcon from '@mui/icons-material/Inbox'

interface EmptyStateProps {
  icon?: React.ReactElement<{ fontSize?: string }>
  title?: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      px={2}
      textAlign="center"
    >
      {icon || (
        <InboxIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      )}
      {title && (
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
      )}
      <Typography variant="body2" color="text.disabled" maxWidth={400} mb={3}>
        {message}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}

export default EmptyState
