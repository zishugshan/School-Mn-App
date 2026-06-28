import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, Grid, Card, CardContent, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Tabs, Tab,
} from '@mui/material'
import { Search, BookmarkAdd, Add, Delete, Edit } from '@mui/icons-material'
import api from '@/api/axios'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { isAdmin, isTeacher } from '@/utils/helpers'
import { libraryApi } from '@/api/library.api'
import type { Book, LibraryRecord } from '@/types'

export default function LibraryPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState<Book[]>([])
  const [myBooks, setMyBooks] = useState<LibraryRecord[]>([])
  const [records, setRecords] = useState<LibraryRecord[]>([])
  const [students, setStudents] = useState<{ id: string; name: string }[]>([])

  const isAdminOrTeacher = isAdmin(user?.role || '') || isTeacher(user?.role || '')
  const isAdminUser = isAdmin(user?.role || '')

  const [issueDialog, setIssueDialog] = useState(false)
  const [issueBookId, setIssueBookId] = useState('')
  const [issueStudentId, setIssueStudentId] = useState('')

  const [bookDialog, setBookDialog] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', publisher: '', quantity: 1, category: '' })

  const fetchBooks = useCallback(async () => {
    try {
      const res = await libraryApi.getBooks()
      setBooks(res.data?.data || res.data || [])
    } catch { toast.error('Failed to load books') }
  }, [])

  const fetchMyBooks = useCallback(async () => {
    try {
      if (user?.role === 'STUDENT') {
        const res = await libraryApi.getMyBooks()
        setMyBooks(res.data?.data || res.data || [])
      }
    } catch { /* ignore */ }
  }, [user])

  const fetchRecords = useCallback(async () => {
    if (!isAdminOrTeacher) return
    try {
      const res = await libraryApi.getRecords()
      setRecords(res.data?.data || res.data || [])
    } catch { /* ignore */ }
  }, [isAdminOrTeacher])

  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.get('/students')
      const page = res.data?.data
      const rawList = page?.content || page || []
      const list = rawList.map((s: any) => ({
        id: String(s.id),
        name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.studentCode || s.id,
      }))
      setStudents(list)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchBooks(), fetchMyBooks(), fetchRecords(), fetchStudents()])
      .finally(() => setLoading(false))
  }, [fetchBooks, fetchMyBooks, fetchRecords, fetchStudents])

  const filtered = books.filter((b) =>
    !search || b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn?.includes(search)
  )

  const handleIssue = async () => {
    if (!issueBookId || !issueStudentId) { toast.error('Select a book and student'); return }
    try {
      await libraryApi.issueBook(issueBookId, issueStudentId)
      toast.success('Book issued')
      setIssueDialog(false)
      setIssueBookId('')
      setIssueStudentId('')
      fetchBooks()
      fetchRecords()
    } catch { toast.error('Failed to issue book') }
  }

  const handleReturn = async (issueId: string) => {
    if (!window.confirm('Return this book?')) return
    try {
      await libraryApi.returnBook(issueId)
      toast.success('Book returned')
      fetchMyBooks()
      fetchRecords()
      fetchBooks()
    } catch { toast.error('Failed to return book') }
  }

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm('Delete this book?')) return
    try {
      await libraryApi.deleteBook(id)
      toast.success('Book deleted')
      fetchBooks()
    } catch { toast.error('Failed to delete book') }
  }

  const openBookDialog = (book?: Book) => {
    if (book) {
      setEditingBook(book)
      setBookForm({
        title: book.title,
        author: book.author || '',
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        quantity: book.quantity || book.totalCopies || 1,
        category: book.category || '',
      })
    } else {
      setEditingBook(null)
      setBookForm({ title: '', author: '', isbn: '', publisher: '', quantity: 1, category: '' })
    }
    setBookDialog(true)
  }

  const handleSaveBook = async () => {
    if (!bookForm.title || !bookForm.author) { toast.error('Title and author are required'); return }
    try {
      if (editingBook) {
        await libraryApi.updateBook(editingBook.id, bookForm)
        toast.success('Book updated')
      } else {
        await libraryApi.createBook(bookForm)
        toast.success('Book added')
      }
      setBookDialog(false)
      fetchBooks()
    } catch { toast.error('Failed to save book') }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Library</Typography>
        {isAdminUser && (
          <Button variant="contained" startIcon={<Add />} onClick={() => openBookDialog()}>
            Add Book
          </Button>
        )}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Browse Books" />
        {user?.role === 'STUDENT' ? (
          <Tab label="My Issued Books" />
        ) : isAdminOrTeacher ? (
          <Tab label="All Records" />
        ) : null}
      </Tabs>

      {tab === 0 && (
        <Box>
          <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth size="small" placeholder="Search by title, author, or ISBN..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            />
            {isAdminUser && (
              <Button variant="contained" onClick={() => setIssueDialog(true)} startIcon={<BookmarkAdd />}>
                Issue Book
              </Button>
            )}
          </Paper>

          {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
            <EmptyState message="No books found" actionLabel="Add Book" onAction={() => openBookDialog()} />
          ) : (
            <Grid container spacing={3}>
              {filtered.map((b) => (
                <Grid key={b.id} item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600}>{b.title}</Typography>
                      <Typography variant="body2" color="text.secondary">by {b.author}</Typography>
                      {b.isbn && <Typography variant="caption" display="block" mt={1}>ISBN: {b.isbn}</Typography>}
                      {b.publisher && <Typography variant="caption" display="block">Publisher: {b.publisher}</Typography>}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Chip size="small" label={b.category || 'General'} color="default" />
                        <Chip
                          size="small"
                          label={`${b.availableCopies}/${b.quantity || b.totalCopies} Available`}
                          color={b.availableCopies > 0 ? 'success' : 'error'}
                        />
                      </Box>
                    </CardContent>
                    {isAdminUser && (
                      <Box display="flex" justifyContent="flex-end" gap={1} px={2} pb={1}>
                        <Button size="small" startIcon={<Edit />} onClick={() => openBookDialog(b)}>Edit</Button>
                        <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDeleteBook(b.id)}>Delete</Button>
                      </Box>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {tab === 1 && user?.role === 'STUDENT' && (
        loading ? <LoadingSpinner /> : myBooks.length === 0 ? (
          <EmptyState message="No books issued" />
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book Title</TableCell>
                    <TableCell>Issue Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myBooks.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.bookTitle}</TableCell>
                      <TableCell>{b.issueDate}</TableCell>
                      <TableCell>{b.dueDate}</TableCell>
                      <TableCell>
                        <Chip size="small" label={b.status} color={b.status === 'issued' ? 'warning' : 'success'} />
                      </TableCell>
                      <TableCell>
                        {b.status === 'issued' ? (
                          <Typography variant="body2" color="text.secondary">
                            Go to Library to return the book
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="success.main">Returned</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )
      )}

      {tab === 1 && isAdminOrTeacher && (
        loading ? <LoadingSpinner /> : records.length === 0 ? (
          <EmptyState message="No records" />
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Issue Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Return Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Fine</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.bookTitle}</TableCell>
                      <TableCell>{r.studentName}</TableCell>
                      <TableCell>{r.issueDate}</TableCell>
                      <TableCell>{r.dueDate}</TableCell>
                      <TableCell>{r.returnDate || '-'}</TableCell>
                      <TableCell>
                        <Chip size="small" label={r.status} color={r.status === 'issued' ? 'warning' : 'success'} />
                      </TableCell>
                      <TableCell>{r.fine ? `$${r.fine}` : '-'}</TableCell>
                      <TableCell>
                        {r.status === 'issued' && (
                          <Button size="small" variant="outlined" color="secondary" onClick={() => handleReturn(r.id)}>
                            Return
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )
      )}

      <Dialog open={issueDialog} onClose={() => setIssueDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Issue Book</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Book</InputLabel>
                <Select value={issueBookId} label="Book" onChange={(e) => setIssueBookId(e.target.value)}>
                  {books.filter(b => b.availableCopies > 0).map((b) => (
                    <MenuItem key={b.id} value={b.id}>{b.title} ({b.availableCopies} avail)</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select value={issueStudentId} label="Student" onChange={(e) => setIssueStudentId(e.target.value)}>
                  {students.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssueDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleIssue}>Issue</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bookDialog} onClose={() => setBookDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBook ? 'Edit Book' : 'Add Book'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" required value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Author" required value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="ISBN" value={bookForm.isbn}
                onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Publisher" value={bookForm.publisher}
                onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Quantity" type="number" value={bookForm.quantity}
                onChange={(e) => setBookForm({ ...bookForm, quantity: Number(e.target.value) })}
                inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Category" value={bookForm.category}
                onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveBook}>{editingBook ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
