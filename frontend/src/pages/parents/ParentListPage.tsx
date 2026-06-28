import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, TextField, InputAdornment, Popover, List, ListItem, ListItemText,
} from '@mui/material'
import { Search } from '@mui/icons-material'
import { parentsApi } from '@/api/parents.api'

interface ParentRow {
  id: string; parentName: string; studentIds?: string[]; childNames?: string[]; children: number;
}

export default function ParentListPage() {
  const navigate = useNavigate()
  const [parents, setParents] = useState<ParentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null)
  const [popoverChildren, setPopoverChildren] = useState<string[]>([])
  const [popoverParentName, setPopoverParentName] = useState('')

  const fetchParents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await parentsApi.getAll()
      const raw: any[] = res.data?.data || []
      setParents(raw.map((p: any) => ({
        id: String(p.id),
        parentName: p.parentName || '-',
        studentIds: (p.studentIds || []).map(String),
        childNames: p.childNames || [],
        children: p.studentIds?.length ?? 0,
      })))
    } catch {
      setParents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchParents() }, [fetchParents])

  const filtered = parents.filter(p =>
    !search || p.parentName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Parents</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          size="small" placeholder="Search parents..." value={search}
          onChange={(e) => setSearch(e.target.value)} fullWidth
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        />
      </Paper>

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Loading...</Typography></Paper>
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{search ? 'No parents match your search.' : 'No parents found.'}</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Children</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/parents/${p.id}`)}>
                  <TableCell><Typography variant="body2" fontWeight={600}>{p.parentName}</Typography></TableCell>
                  <TableCell>
                    {p.childNames && p.childNames.length > 0 ? (
                      <Chip
                        size="small"
                        label={`${p.childNames.length} child${p.childNames.length > 1 ? 'ren' : ''}`}
                        color="primary"
                        sx={{ height: 20, fontSize: '0.65rem', cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); setPopoverAnchor(e.currentTarget); setPopoverChildren(p.childNames || []); setPopoverParentName(p.parentName) }}
                      />
                    ) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Popover
        open={!!popoverAnchor}
        anchorEl={popoverAnchor}
        onClose={() => setPopoverAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, pt: 1, fontWeight: 700 }}>
          Children of {popoverParentName}
        </Typography>
        <List dense sx={{ maxHeight: 200, overflow: 'auto', minWidth: 160 }}>
          {popoverChildren.map((name, i) => (
            <ListItem key={i}><ListItemText primary={name} primaryTypographyProps={{ variant: 'body2' }} /></ListItem>
          ))}
        </List>
      </Popover>
    </Box>
  )
}
