import { LOCKOUT_MINUTES } from '../config'

export const isMatchLocked = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return false

  const [day, month] = dateStr.split('/').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  const matchTime = new Date(2026, month - 1, day, hours, minutes, 0)
  const lockoutTime = new Date(matchTime.getTime() - LOCKOUT_MINUTES * 60000)
  const now = new Date()

  return now >= lockoutTime
}
