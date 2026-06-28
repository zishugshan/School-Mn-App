import api from './client'
import type { LeaderboardEntry, LeaderboardType, LeaderboardPeriod } from '@/types'

export const leaderboardApi = {
  get: (type: LeaderboardType, period: LeaderboardPeriod, year?: number, month?: number) =>
    api.get<LeaderboardEntry[]>('/leaderboard', { params: { type, period, year, month } }),
  getByClass: (classId: string, type: LeaderboardType, period: LeaderboardPeriod) =>
    api.get<LeaderboardEntry[]>('/leaderboard/class', { params: { classId, type, period } }),
}
