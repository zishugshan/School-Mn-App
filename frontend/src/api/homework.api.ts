import api from './client'

export const homeworkApi = {
  getByStudent: (studentId: string) =>
    api.get(`/homework/student/${studentId}`),
  getByTeacher: (teacherId: string) =>
    api.get(`/homework/teacher/${teacherId}`),
  getById: (id: string) =>
    api.get(`/homework/${id}`),
  getSubmissionsByStudent: (studentId: string) =>
    api.get(`/homework/submissions/student/${studentId}`),
  getSubmissionsByHomework: (homeworkId: string) =>
    api.get(`/homework/submissions/homework/${homeworkId}`),
  submit: (data: { homeworkId: string; studentId: string; submissionText?: string }) =>
    api.post('/homework/submit', data),
  grade: (submissionId: string, score: number, feedback?: string) =>
    api.put(`/homework/submissions/${submissionId}/grade`, null, { params: { score, feedback } }),
  getDoubts: (homeworkId: string) =>
    api.get(`/homework/${homeworkId}/doubts`),
  createDoubt: (homeworkId: string, data: { senderId: string; message: string; parentDoubtId?: string }) =>
    api.post(`/homework/${homeworkId}/doubts`, data),
  resolveDoubt: (doubtId: string) =>
    api.put(`/homework/doubts/${doubtId}/resolve`),
  createHomework: (data: {
    title: string; description?: string; subjectId: number; teacherId: number;
    dueDate: string; maxScore?: number; targets?: Array<{ classId: number; sectionId?: number }>;
    isBroadcast?: boolean; broadcastLevel?: string;
  }) => api.post('/homework', data),
  deleteHomework: (id: string) =>
    api.delete(`/homework/${id}`),
}
