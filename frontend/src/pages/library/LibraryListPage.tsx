import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  IconButton, Tooltip,
} from '@mui/material'
import { Add, Delete, OpenInNew, PictureAsPdf, MenuBook, Link as LinkIcon, LibraryBooks } from '@mui/icons-material'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { toast } from 'react-toastify'
import { libraryApi, uploadFile, type CreateResourcePayload } from '@/api/library.api'
import api from '@/api/axios'
import type { LibraryResource } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { isAdmin, isTeacher } from '@/utils/helpers'

const resourceTypeColors: Record<string, 'error' | 'primary' | 'info'> = {
  PDF: 'error',
  BOOK: 'primary',
  LINK: 'info',
}

const ALL_CATEGORIES = '__all__'

interface ClassItem { id: string; name: string }

export default function LibraryListPage() {
  const [loading, setLoading] = useState(true)
  const [resources, setResources] = useState<LibraryResource[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES)

  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formResourceType, setFormResourceType] = useState('LINK')
  const [formUrl, setFormUrl] = useState('')
  const [formFile, setFormFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formCategory, setFormCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [formClassId, setFormClassId] = useState('')
  const [useNewCategory, setUseNewCategory] = useState(false)

  const { user } = useAuth()
  const isAdminUser = isAdmin(user?.role || '') || isTeacher(user?.role || '')

  const fetchResources = useCallback(async () => {
    setLoading(true)
    try {
      const res = selectedCategory === ALL_CATEGORIES
        ? await libraryApi.getResources()
        : await libraryApi.getResourcesByCategory(selectedCategory)
      setResources(res.data.data || [])
    } catch { toast.error('Failed to load resources') }
    finally { setLoading(false) }
  }, [selectedCategory])

  useEffect(() => { fetchResources() }, [fetchResources])

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data?.data || [])).catch(() => {})
    libraryApi.getResources().then(res => {
      const cats = [...new Set((res.data.data || []).map(r => r.category))] as string[]
      setCategories(cats.sort())
    }).catch(() => {})
  }, [])

  const handleCreate = async () => {
    if (!formTitle || !formCategory && !newCategory) {
      toast.error('Please fill in required fields')
      return
    }
    const hasFile = formResourceType !== 'LINK' && formFile
    const hasUrl = !!formUrl
    if (!hasFile && !hasUrl) {
      toast.error('Please provide a URL or upload a file')
      return
    }
    setUploading(true)
    try {
      let url = formUrl
      if (hasFile) {
        url = await uploadFile(formFile!)
      }
      const payload: CreateResourcePayload = {
        title: formTitle,
        description: formDescription,
        resourceType: formResourceType,
        url,
        category: useNewCategory ? newCategory : formCategory,
      }
      if (formClassId) payload.classId = Number(formClassId)
      await libraryApi.createResource(payload)
      toast.success('Resource created successfully')
      setDialogOpen(false)
      resetForm()
      fetchResources()
    } catch { toast.error('Failed to create resource') }
    finally { setUploading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this resource?')) return
    try {
      await libraryApi.deleteResource(id)
      toast.success('Resource deleted')
      fetchResources()
    } catch { toast.error('Failed to delete resource') }
  }

  const resetForm = () => {
    setFormTitle('')
    setFormDescription('')
    setFormResourceType('LINK')
    setFormUrl('')
    setFormFile(null)
    setFormCategory('')
    setNewCategory('')
    setFormClassId('')
    setUseNewCategory(false)
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <LibraryBooks sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>Library Resources</Typography>
        </Box>
        {isAdminUser && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Add Resource
          </Button>
        )}
      </Box>

      <Box display="flex" gap={1} mb={3} flexWrap="wrap">
        <Chip label="All" color={selectedCategory === ALL_CATEGORIES ? 'primary' : 'default'}
          onClick={() => setSelectedCategory(ALL_CATEGORIES)} />
        {categories.map(cat => (
          <Chip key={cat} label={cat} color={selectedCategory === cat ? 'primary' : 'default'}
            onClick={() => setSelectedCategory(cat)} />
        ))}
      </Box>

      {loading ? <LoadingSpinner /> : resources.length === 0 ? (
        <EmptyState message="No resources yet."
          actionLabel={isAdminUser ? 'Add Resource' : undefined}
          onAction={isAdminUser ? () => setDialogOpen(true) : undefined} />
      ) : (
        <Grid container spacing={3}>
          {resources.map(r => (
            <Grid key={r.id} item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" fontWeight={600}>{r.title}</Typography>
                    <Chip size="small"
                      icon={r.resourceType === 'PDF' ? <PictureAsPdf /> : r.resourceType === 'BOOK' ? <MenuBook /> : <LinkIcon />}
                      label={r.resourceType} color={resourceTypeColors[r.resourceType]} />
                  </Box>
                  {r.description && (
                    <Typography variant="body2" color="text.secondary" mb={2}>{r.description}</Typography>
                  )}
                  <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                    <Chip size="small" label={r.category} variant="outlined" />
                    {r.className && <Chip size="small" label={r.className} variant="outlined" color="secondary" />}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Added by {r.uploadedByName} &middot; {new Date(r.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<OpenInNew />}
                    href={r.url} target="_blank" rel="noopener noreferrer">
                    Open
                  </Button>
                  {(isAdmin(user?.role || '') || String(r.uploadedById) === user?.id) && (
                    <>
                      <Box flexGrow={1} />
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(r.id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add {formResourceType === 'LINK' ? 'Link' : formResourceType === 'PDF' ? 'PDF' : 'Book'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" required value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select value={formResourceType} label="Type" onChange={(e) => setFormResourceType(e.target.value)}>
                  <MenuItem value="PDF">PDF</MenuItem>
                  <MenuItem value="BOOK">Book</MenuItem>
                  <MenuItem value="LINK">Link</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Class (optional)</InputLabel>
                <Select value={formClassId} label="Class (optional)" onChange={(e) => setFormClassId(e.target.value)}>
                  <MenuItem value="">None</MenuItem>
                  {classes.map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {formResourceType === 'LINK' ? (
              <Grid item xs={12}>
                <TextField fullWidth label="URL" required value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://..." />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <Button variant="outlined" component="label" fullWidth sx={{ py: 3, borderStyle: 'dashed' }}>
                  {formFile ? formFile.name : 'Click to upload file'}
                  <input type="file" hidden accept={formResourceType === 'PDF' ? '.pdf' : '.pdf,.epub,.mobi'}
                    onChange={(e) => setFormFile(e.target.files?.[0] || null)} />
                </Button>
                <TextField fullWidth label="Or enter URL instead" value={formUrl} sx={{ mt: 1 }}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://..." />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={useNewCategory ? '__new__' : formCategory} label="Category"
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setUseNewCategory(true)
                      setFormCategory('')
                    } else {
                      setUseNewCategory(false)
                      setFormCategory(e.target.value)
                    }
                  }}>
                  {categories.map(c => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                  <MenuItem value="__new__">+ New Category</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {useNewCategory && (
              <Grid item xs={12}>
                <TextField fullWidth label="New Category" required value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)} />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={uploading}>{uploading ? 'Uploading...' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
