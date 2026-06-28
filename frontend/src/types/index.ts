export type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  role: UserRole
  classId?: string
  sectionId?: string
}

export interface StudentDashboard {
  totalClasses: number
  totalAssignments: number
  attendancePercentage: number
  upcomingTests: number
  recentMarks: MarksSummary[]
  recentHomework: Homework[]
  attendanceTrend: { date: string; status: string }[]
}

export interface TeacherDashboard {
  totalStudents: number
  totalClasses: number
  totalAssignments: number
  pendingGrading: number
  recentHomework: Homework[]
}

export interface ParentDashboard {
  childrenCount: number
  announcements: { id: string; title: string; date: string }[]
}

export type HomeworkStatus = 'pending' | 'submitted' | 'graded' | 'overdue'

export type TestType = 'unit_test' | 'midterm' | 'final' | 'quiz' | 'assignment'

export type Gender = 'male' | 'female'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  photo?: string
  role: UserRole
  createdAt?: string
  updatedAt?: string
}

export interface AuthUser extends User {
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface ForgotPasswordPayload {
  email: string
}

export interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  forgotPassword: (data: ForgotPasswordPayload) => Promise<void>
  isAuthenticated: boolean
}

export interface Student {
  id: string
  userId: string
  name: string
  email: string
  phone?: string
  photo?: string
  classId: string
  sectionId: string
  rollNumber: string
  admissionNumber: string
  gender: 'male' | 'female'
  dateOfBirth: string
  address?: string
  bloodGroup?: string
  houseId?: string
  parentIds: string[]
  status: 'active' | 'inactive' | 'graduated' | 'transferred'
  createdAt: string
  updatedAt: string
}

export interface Teacher {
  id: string
  userId: string
  name: string
  email: string
  phone?: string
  photo?: string
  employeeCode: string
  qualification?: string
  specialization?: string
  subjectIds: string[]
  classIds: string[]
  gender: 'male' | 'female'
  dateOfBirth?: string
  address?: string
  bloodGroup?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Parent {
  id: string
  userId: string
  name: string
  email: string
  phone?: string
  photo?: string
  studentIds: string[]
  occupation?: string
  address?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Class {
  id: string
  name: string
  sections: Section[]
  teacherId?: string
  subjectIds: string[]
  studentCount?: number
  createdAt: string
  updatedAt: string
}

export interface Section {
  id: string
  classId: string
  name: string
  studentCount?: number
}

export interface Subject {
  id: string
  name: string
  code: string
  description?: string
  teacherIds: string[]
  classIds: string[]
  createdAt: string
  updatedAt: string
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE'

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  studentCode: string
  className: string
  sectionName: string
  date: string
  status: AttendanceStatus
  remarks?: string
  createdAt: string
}

export interface AttendanceEntry {
  studentId: string
  status: AttendanceStatus
  remarks?: string
}

export interface BulkAttendanceRequest {
  classId: string
  sectionId: string
  date: string
  students: AttendanceEntry[]
}

export interface Homework {
  id: string
  title: string
  description?: string
  subjectName?: string
  teacherId: string
  teacherName?: string
  dueDate: string
  maxScore: number
  attachmentUrl?: string
  targetClasses?: string[]
  createdAt: string
}

export interface HomeworkSubmission {
  id: string
  homeworkId: string
  homeworkTitle?: string
  studentId: string
  studentName?: string
  studentCode?: string
  submissionText?: string
  score?: number
  feedback?: string
  status: string
  submittedAt?: string
  gradedAt?: string
}

export interface CreateHomeworkPayload {
  title: string
  description: string
  subjectId: string
  classId: string
  sectionId: string
  dueDate: string
  maxScore: number
  attachments: string[]
  broadcast: 'all' | 'class' | 'section'
}

export interface HomeworkDoubt {
  id: string
  homeworkId: string
  senderId: string
  senderName: string
  senderRole: string
  message: string
  parentDoubtId?: string
  isResolved: boolean
  createdAt: string
  replies: HomeworkDoubt[]
}

export interface Test {
  id: string
  title: string
  description: string
  subjectId: string
  subjectName?: string
  classId: string
  sectionId: string
  maxMarks: number
  passingMarks: number
  testDate: string
  examType: string
  published: boolean
  teacherId: string
  createdAt: string
  updatedAt: string
}

export interface TestMark {
  id: string
  testId: string
  studentId: string
  studentName?: string
  marksObtained: number
  percentage?: number
  grade?: string
  remark?: string
  enteredBy: string
  createdAt: string
  updatedAt: string
}

export interface TestLeaderboardEntry {
  rank: number
  studentId: string
  studentName: string
  marksObtained: number
  percentage: number
}

export interface CreateTestPayload {
  title: string
  description: string
  subjectId: string
  classId: string
  sectionId: string
  maxMarks: number
  passingMarks: number
  testDate: string
  examType: string
}

export interface MarksSummary {
  subjectId: string
  subjectName: string
  obtained: number
  total: number
  percentage: number
  average: number
  highest: number
  lowest: number
}

export interface MarksTrend {
  date: string
  percentage: number
  subject: string
}

export interface StudentMark {
  id: string
  testId: string
  testName: string
  studentId: string
  studentName: string
  studentCode: string
  marksObtained: number
  maximumMarks: number
  remarks: string | null
  createdAt: string
}

export interface MarksSummaryResponse {
  totalTests: number
  overallAverage: number
  highestScore: number
  lowestScore: number
  subjects: MarksSubjectSummary[]
}

export interface MarksSubjectSummary {
  subjectName: string
  marks: {
    testId: string
    testName: string
    marksObtained: number
    maximumMarks: number
    testDate: string
  }[]
  average: number
  highest: number
  lowest: number
}

export interface LeaderboardEntry {
  rank: number
  studentId: string
  studentName: string
  className: string
  score: number
  badge?: 'gold' | 'silver' | 'bronze'
}

export type LeaderboardType = 'attendance' | 'homework' | 'academics'
export type LeaderboardPeriod = 'monthly' | 'yearly'

export interface Report {
  id: string
  title: string
  type: 'student-report-card' | 'attendance-report' | 'homework-report' | 'class-report'
  studentId?: string
  classId?: string
  dateRange: { from: string; to: string }
  format: 'pdf' | 'excel'
  generatedAt: string
  url?: string
}

export interface AnalyticsFilter {
  dateFrom: string
  dateTo: string
  classId?: string
  sectionId?: string
  subjectId?: string
}

export interface AttendanceAnalytics {
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  percentage: number
  monthlyTrend: { month: string; percentage: number }[]
}

export interface PerformanceAnalytics {
  subjectWise: { subject: string; average: number; highest: number }[]
  classComparison: { className: string; average: number }[]
}

export interface SchoolOverview {
  totalStudents: number
  totalTeachers: number
  genderRatio: { male: number; female: number }
  passRate: number
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  read: boolean
  link?: string
  createdAt: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'event' | 'holiday' | 'exam' | 'meeting'
  description?: string
  allDay: boolean
  time?: string
}

export interface SchoolEvent {
  id: string
  title: string
  description: string
  date: string
  endDate?: string
  type: 'sports' | 'cultural' | 'academic' | 'meeting' | 'other'
  house?: string
  participants: string[]
  registeredStudents: string[]
  location?: string
  createdAt: string
}

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  publisher?: string
  edition?: string
  category?: string
  quantity?: number
  totalCopies: number
  availableCopies: number
  shelfLocation?: string
  createdAt: string
}

export interface LibraryRecord {
  id: string
  bookId: string
  bookTitle?: string
  studentId: string
  studentName?: string
  issuedBy: string
  issueDate: string
  dueDate: string
  returnDate?: string
  status: 'issued' | 'returned' | 'overdue'
  fine?: number
}

export interface LibraryResource {
  id: string
  title: string
  description?: string
  resourceType: 'PDF' | 'BOOK' | 'LINK'
  url: string
  category: string
  classId?: string
  className?: string
  uploadedById?: string
  uploadedByRole?: string
  uploadedByName: string
  createdAt: string
}

export interface TransportRoute {
  id: string
  name: string
  description?: string
  driverName: string
  driverPhone: string
  vehicleNumber: string
  vehicleType: string
  capacity: number
  stops: TransportStop[]
  status: 'active' | 'inactive'
}

export interface TransportStop {
  id: string
  routeId: string
  name: string
  address: string
  pickupTime: string
  dropTime: string
  fee: number
  order: number
}

export interface StudentTransport {
  studentId: string
  routeId: string
  routeName?: string
  stopId: string
  stopName?: string
  pickupTime?: string
  dropTime?: string
  fee: number
}

export interface ChatConversation {
  userId: string
  userName: string
  userRole: string
  profilePhoto: string | null
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  receiverName: string
  content: string
  isRead: boolean
  sentAt: string
  readAt: string | null
}

export interface ChatUser {
  id: string
  name: string
  email: string
  role: string
  profilePhoto: string | null
}

export interface Remark {
  id: string
  studentId: string
  studentName: string
  studentCode: string
  teacherId: string
  teacherName: string
  subjectId?: string
  subjectName?: string
  remark: string
  category: string
  isPositive: boolean
  createdAt: string
}

export interface Goal {
  id: string
  studentId?: string
  studentName?: string
  userId?: string
  title: string
  description: string
  targetValue: number
  currentProgress: number
  unit?: string
  targetDate?: string
  category: string
  status: string
  createdAt: string
  updatedAt?: string
}

export interface Certificate {
  id: string
  studentId: string
  studentName?: string
  title: string
  description: string
  type: 'achievement' | 'participation' | 'merit' | 'completion'
  issuedDate: string
  issuedBy: string
  fileUrl?: string
  status: 'issued' | 'requested' | 'pending'
}

export interface FeeSummary {
  totalFees: number
  paid: number
  balance: number
  dueDate: string
}

export interface FeeRecord {
  id: string
  studentId: string
  studentName?: string
  feeType: string
  amount: number
  paidAmount: number
  dueDate: string
  status: 'paid' | 'partial' | 'unpaid' | 'overdue'
  paidDate?: string
  paymentMethod?: string
  transactionId?: string
}

export interface TimetableEntry {
  id: string
  classId: string
  sectionId: string
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'
  period: number
  subjectId: string
  subjectName?: string
  teacherId: string
  teacherName?: string
  room: string
  startTime: string
  endTime: string
}

export interface ExamSchedule {
  id: string
  title: string
  examType: string
  subjectName: string
  className: string
  sectionName?: string
  date: string
  startTime: string
  endTime: string
  room?: string
}

export interface House {
  id: string
  name: string
  color: string
  motto: string
  points: number
  memberCount: number
  leaderName?: string
}

export interface Achievement {
  id: string
  studentId: string
  title: string
  description: string
  date: string
  type: 'academic' | 'sports' | 'cultural' | 'other'
  badge?: string
}
