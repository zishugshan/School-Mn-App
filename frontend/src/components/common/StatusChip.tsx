import Chip from '@mui/material/Chip'
import { getStatusColor } from '../../utils/helpers'

interface StatusChipProps {
  status: string
  label?: string
  size?: 'small' | 'medium'
}

const StatusChip: React.FC<StatusChipProps> = ({ status, label, size = 'small' }) => {
  const color = getStatusColor(status)

  return (
    <Chip
      label={label || status}
      size={size}
      sx={{
        backgroundColor: `${color}20`,
        color: color,
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    />
  )
}

export default StatusChip
