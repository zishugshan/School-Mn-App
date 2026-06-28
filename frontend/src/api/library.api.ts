import api from './axios'
import type { Book, LibraryRecord, LibraryResource } from '@/types'
import type { ApiResponse } from '@/types'
import axios from 'axios'

export interface CreateResourcePayload {
  title: string
  description?: string
  resourceType: string
  url: string
  category: string
  classId?: number
}

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  const token = localStorage.getItem('accessToken')
  const res = await axios.post<ApiResponse<{ fileUrl: string }>>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data.data.fileUrl
}

export const libraryApi = {
  // Physical books
  getBooks: (params?: Record<string, string>) => api.get<ApiResponse<Book[]>>('/library/books', { params }),
  getBookById: (id: string) => api.get<ApiResponse<Book>>(`/library/books/${id}`),
  createBook: (data: Partial<Book>) => api.post<ApiResponse<Book>>('/library/books', data),
  updateBook: (id: string, data: Partial<Book>) => api.put<ApiResponse<Book>>(`/library/books/${id}`, data),
  deleteBook: (id: string) => api.delete<ApiResponse<void>>(`/library/books/${id}`),
  issueBook: (bookId: string, studentId: string) =>
    api.post<ApiResponse<LibraryRecord>>(`/library/books/${bookId}/issue/${studentId}`),
  returnBook: (issueId: string) => api.put<ApiResponse<void>>(`/library/books/issue/${issueId}/return`),
  getMyBooks: () => api.get<ApiResponse<LibraryRecord[]>>('/library/my-books'),
  getRecords: (params?: Record<string, string>) =>
    api.get<ApiResponse<LibraryRecord[]>>('/library/records', { params }),

  // Digital resources
  getResources: () => api.get<ApiResponse<LibraryResource[]>>('/library/resources'),
  searchResources: (q: string) => api.get<ApiResponse<LibraryResource[]>>(`/library/resources/search?q=${q}`),
  getResourcesByCategory: (category: string) =>
    api.get<ApiResponse<LibraryResource[]>>(`/library/resources/category/${category}`),
  getResourcesByClass: (classId: string) =>
    api.get<ApiResponse<LibraryResource[]>>(`/library/resources/class/${classId}`),
  createResource: (data: CreateResourcePayload) =>
    api.post<ApiResponse<LibraryResource>>('/library/resources', data),
  deleteResource: (id: string) => api.delete<ApiResponse<void>>(`/library/resources/${id}`),
}
