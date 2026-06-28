import api from './axios'

export const getProfile = () => api.get('/profile/me')

export const updateProfile = (data: FormData) => api.put('/profile/me', data)

export const changePassword = (data: { currentPassword: string; newPassword: string }) => api.put('/profile/me/password', data)

export const uploadProfilePhoto = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/profile/me/photo', formData)
}
