import { PARTICIPANTS_DB, ADMIN_PIN } from '../config/participants'
import { getParticipantByName } from './supabase'
import bcrypt from 'bcryptjs'

// Validate participant - uses Supabase if available, falls back to local
export const validateParticipant = async (name, password) => {
  const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL

  if (hasSupabase) {
    // Try Supabase first
    const { data, error } = await getParticipantByName(name)
    if (error || !data) {
      console.warn(`[Auth] Participant "${name}" not found in Supabase, trying local`)
    } else {
      // Compare password with hash
      try {
        const match = await bcrypt.compare(password, data.password_hash)
        return match
      } catch (err) {
        console.error('[Auth] Password comparison failed:', err.message)
        return false
      }
    }
  }

  // Fallback to local PARTICIPANTS_DB
  return PARTICIPANTS_DB[name]?.password === password
}

export const validateAdmin = (pin) => {
  return pin === ADMIN_PIN
}

export const getSession = () => {
  try {
    const session = localStorage.getItem('wc26_session')
    return session ? JSON.parse(session) : null
  } catch (err) {
    console.error('[Auth] Failed to get session:', err.message)
    return null
  }
}

export const setSession = (type, user) => {
  try {
    localStorage.setItem('wc26_session', JSON.stringify({
      type,
      user,
      timestamp: Date.now()
    }))
  } catch (err) {
    console.error('[Auth] Failed to set session:', err.message)
  }
}

export const clearSession = () => {
  try {
    localStorage.removeItem('wc26_session')
  } catch (err) {
    console.error('[Auth] Failed to clear session:', err.message)
  }
}

export const isSessionValid = () => {
  const session = getSession()
  return session && session.user
}

// Hash password for storing in database
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}
