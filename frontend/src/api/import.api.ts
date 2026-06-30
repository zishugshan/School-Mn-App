import api from './client'

export const importApi = {
  importStudents: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/import/students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  importTeachers: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/import/teachers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
