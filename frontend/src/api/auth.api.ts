import api from './axios'

export const login = (data: { email: string; password: string }) => api.post('/auth/login', data)

export const forgotPassword = (data: { email: string }) => api.post('/auth/forgot-password', data)

export const resetPassword = (data: { token: string; password: string }) => api.post('/auth/reset-password', data)

export const getProfile = () => api.get('/auth/profile')

export const updateProfile = (data: FormData) => api.put('/auth/profile', data)

export const changePassword = (data: { currentPassword: string; newPassword: string }) => api.put('/auth/change-password', data)
