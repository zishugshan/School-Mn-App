import api from './client'
import type { FeeSummary, FeeRecord } from '@/types'

export const feesApi = {
  getSummary: (studentId?: string) => api.get<FeeSummary>('/fees/summary', { params: { studentId } }),
  getRecords: (studentId?: string) =>
    api.get<FeeRecord[]>('/fees/records', { params: { studentId } }),
  payFee: (data: { recordId: string; amount: number; method: string }) =>
    api.post('/fees/pay', data),
  createRecord: (data: Partial<FeeRecord>) => api.post<FeeRecord>('/fees/records', data),
  updateRecord: (id: string, data: Partial<FeeRecord>) =>
    api.put<FeeRecord>(`/fees/records/${id}`, data),
  deleteRecord: (id: string) => api.delete(`/fees/records/${id}`),
  getTypes: () => api.get<string[]>('/fees/types'),
  createType: (name: string) => api.post('/fees/types', { name }),
}
