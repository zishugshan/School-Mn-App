import { useState, useRef, DragEvent } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  multiple?: boolean
  accept?: string
  maxFiles?: number
  maxSize?: number
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  multiple = false,
  accept,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024,
}) => {
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }

  const handleSelect = () => {
    inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((f) => {
      if (f.size > maxSize) return false
      if (accept) {
        const ext = f.name.split('.').pop()
        if (!accept.includes(ext || '')) return false
      }
      return true
    })

    const totalFiles = multiple ? [...files, ...validFiles].slice(0, maxFiles) : validFiles.slice(0, 1)
    setFiles(totalFiles)
    onFilesSelected(totalFiles)
  }

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onFilesSelected(updated)
  }

  return (
    <Box>
      <Paper
        variant="outlined"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelect}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          borderColor: dragOver ? 'primary.main' : 'divider',
          borderWidth: dragOver ? 2 : 1,
          backgroundColor: dragOver ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple={multiple}
          accept={accept}
          onChange={handleInputChange}
        />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Drag & drop files here or click to browse
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Max {maxFiles} file{maxFiles > 1 ? 's' : ''}, up to {maxSize / 1024 / 1024}MB each
        </Typography>
        <Box mt={2}>
          <Button variant="outlined" size="small">
            Browse Files
          </Button>
        </Box>
      </Paper>
      {files.length > 0 && (
        <Box mt={2}>
          {files.map((file, index) => (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              gap={1}
              p={1}
              sx={{ backgroundColor: 'grey.50', borderRadius: 1, mb: 0.5 }}
            >
              <InsertDriveFileIcon fontSize="small" color="primary" />
              <Typography variant="body2" flex={1}>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {(file.size / 1024).toFixed(1)} KB
              </Typography>
              <IconButton size="small" onClick={() => removeFile(index)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default FileUpload
