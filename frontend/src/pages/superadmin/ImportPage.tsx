import { useState, useRef } from 'react'
import {
  Box, Paper, Typography, Button, LinearProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Alert, IconButton,
} from '@mui/material'
import { CloudUpload, Download, Close } from '@mui/icons-material'
import { importApi } from '@/api/import.api'
import { toast } from 'react-toastify'

interface ImportError {
  rowNumber: number
  email: string
  message: string
}

interface ImportResult {
  message: string
  totalRows: number
  successCount: number
  errorCount: number
  errors: ImportError[]
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<'students' | 'teachers'>('students')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      toast.error('Please upload a CSV or Excel file (.csv, .xlsx, .xls)')
      return
    }
    setFile(f)
    setResult(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setResult(null)
    try {
      const fn = importType === 'students' ? importApi.importStudents : importApi.importTeachers
      const r = await fn(file)
      const data = r.data?.data
      setResult(data)
      if (data?.errorCount === 0) {
        toast.success(`Imported ${data.successCount} ${importType} successfully`)
      } else {
        toast.warning(`Imported ${data.successCount} ${importType} with ${data.errorCount} errors`)
      }
    } catch {
      toast.error('Import failed')
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const headers = importType === 'students'
      ? 'First Name,Last Name,Email,Date of Birth,Gender,Class,Section,Address,City,State,Pin Code'
      : 'First Name,Last Name,Email,Date of Birth,Gender,Qualification,Address,Phone'
    const blob = new Blob([headers], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${importType}_import_template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Import {importType === 'students' ? 'Students' : 'Teachers'}
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <Button
          variant={importType === 'students' ? 'contained' : 'outlined'}
          onClick={() => { setImportType('students'); setResult(null) }}
        >
          Students
        </Button>
        <Button
          variant={importType === 'teachers' ? 'contained' : 'outlined'}
          onClick={() => { setImportType('teachers'); setResult(null) }}
        >
          Teachers
        </Button>
        <Box flex={1} />
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={downloadTemplate}
        >
          Download Template
        </Button>
      </Box>

      <Paper
        sx={{
          p: 4, mb: 3, textAlign: 'center', cursor: 'pointer',
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : file ? 'success.main' : 'grey.300',
          bgcolor: dragOver ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".csv,.xlsx,.xls"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        {file ? (
          <Box>
            <Typography variant="body1" fontWeight={600} color="success.main">
              {file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(file.size / 1024).toFixed(1)} KB
            </Typography>
            <Box mt={2}>
              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null) }}>
                <Close />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box>
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              Drop a CSV or Excel file here, or click to browse
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Supports .csv, .xlsx, .xls
            </Typography>
          </Box>
        )}
      </Paper>

      {file && !importing && (
        <Box textAlign="center" mb={3}>
          <Button
            variant="contained"
            size="large"
            onClick={handleImport}
            disabled={!file}
          >
            Import {file.name}
          </Button>
        </Box>
      )}

      {importing && (
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Importing... Please wait
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {result && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Import Results
          </Typography>
          <Box display="flex" gap={3} mb={3}>
            <Chip label={`Total: ${result.totalRows}`} variant="outlined" />
            <Chip label={`Success: ${result.successCount}`} color="success" />
            <Chip label={`Errors: ${result.errorCount}`} color={result.errorCount > 0 ? 'error' : 'default'} />
          </Box>
          {result.errors.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {result.message}
            </Alert>
          )}
          {result.errors.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Row</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Error</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.errors.map((err, i) => (
                    <TableRow key={i}>
                      <TableCell>{err.rowNumber}</TableCell>
                      <TableCell>{err.email}</TableCell>
                      <TableCell>{err.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Box>
  )
}
