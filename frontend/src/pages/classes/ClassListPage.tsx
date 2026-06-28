import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, TextField, InputAdornment, Popover, List, ListItem, ListItemText, ListItemButton,
  CircularProgress,
} from '@mui/material'
import { Search, People } from '@mui/icons-material'
import { classesApi } from '@/api/classes.api'
import { studentsApi } from '@/api/students.api'

interface SectionInfo {
  id: string; name: string;
}
interface ClassRow {
  id: string; name: string; sections?: SectionInfo[];
  studentCount?: number; teacherId?: string;
}

interface StudentInfo {
  id: string; firstName: string; lastName: string; studentCode?: string;
}

interface SectionStudentCache {
  [classId: string]: { [sectionId: string]: StudentInfo[] }
}

export default function ClassListPage() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sectionCache, setSectionCache] = useState<SectionStudentCache>({})
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null)
  const [popoverStudents, setPopoverStudents] = useState<StudentInfo[]>([])
  const [popoverLoading, setPopoverLoading] = useState(false)
  const [popoverTitle, setPopoverTitle] = useState('')

  const allSectionNames = ['A', 'B', 'C']

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await classesApi.getAll()
      setClasses(res.data?.data || [])
    } catch {
      setClasses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  const handleSectionClick = async (e: React.MouseEvent<HTMLElement>, cls: ClassRow, sec: SectionInfo) => {
    e.stopPropagation()
    setPopoverAnchor(e.currentTarget)
    setPopoverTitle(`${cls.name} - Section ${sec.name}`)
    const cached = sectionCache[cls.id]?.[sec.id]
    if (cached) {
      setPopoverStudents(cached)
      return
    }
    setPopoverLoading(true)
    setPopoverStudents([])
    try {
      const res = await studentsApi.getByClassAndSection(cls.id, sec.id)
      const list: StudentInfo[] = (res.data?.data || []).map((s: any) => ({
        id: String(s.id),
        firstName: s.firstName || '',
        lastName: s.lastName || '',
        studentCode: s.studentCode || '',
      }))
      setPopoverStudents(list)
      setSectionCache(prev => ({
        ...prev,
        [cls.id]: { ...prev[cls.id], [sec.id]: list },
      }))
    } catch {
      setPopoverStudents([])
    } finally {
      setPopoverLoading(false)
    }
  }

  const getSectionMap = (cls: ClassRow): Record<string, SectionInfo> => {
    const map: Record<string, SectionInfo> = {}
    for (const sec of cls.sections || []) {
      map[sec.name.toUpperCase()] = sec
    }
    return map
  }

  const getSectionCount = (cls: ClassRow, sec: SectionInfo): number => {
    const cached = sectionCache[cls.id]?.[sec.id]
    return cached ? cached.length : 0
  }

  const filtered = classes.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Classes</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          size="small" placeholder="Search classes..." value={search}
          onChange={(e) => setSearch(e.target.value)} fullWidth
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        />
      </Paper>

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Loading...</Typography></Paper>
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{search ? 'No classes match your search.' : 'No classes found.'}</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Class Name</TableCell>
                {allSectionNames.map(sn => (
                  <TableCell key={sn} sx={{ fontWeight: 700 }}>Students_{sn}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((c) => {
                const secMap = getSectionMap(c)
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Typography
                        variant="body2" fontWeight={600} color="primary"
                        sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => navigate(`/classes/${c.id}`)}
                      >
                        {c.name}
                      </Typography>
                    </TableCell>
                    {allSectionNames.map(sn => {
                      const sec = secMap[sn]
                      if (!sec) {
                        return <TableCell key={sn}>-</TableCell>
                      }
                      const count = getSectionCount(c, sec)
                      return (
                        <TableCell key={sn}>
                          <Chip
                            icon={<People />}
                            size="small"
                            label={count > 0 ? `${count} student${count > 1 ? 's' : ''}` : sn}
                            color="primary"
                            variant={count > 0 ? 'outlined' : 'filled'}
                            sx={{ height: 24, cursor: 'pointer' }}
                            onClick={(e) => handleSectionClick(e, c, sec)}
                          />
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Popover
        open={!!popoverAnchor}
        anchorEl={popoverAnchor}
        onClose={() => setPopoverAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { minWidth: 220, maxHeight: 350 } }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 0.5, fontWeight: 700 }}>
          {popoverTitle}
        </Typography>
        {popoverLoading ? (
          <Box display="flex" justifyContent="center" py={2}><CircularProgress size={20} /></Box>
        ) : popoverStudents.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>No students</Typography>
        ) : (
          <List dense disablePadding>
            {popoverStudents.map((s) => (
              <ListItem key={s.id} disablePadding>
                <ListItemButton onClick={() => { setPopoverAnchor(null); navigate(`/students/${s.id}`) }}>
                  <ListItemText
                    primary={`${s.firstName} ${s.lastName}`}
                    secondary={s.studentCode}
                    primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: 11 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </Box>
  )
}