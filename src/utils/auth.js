import { PARTICIPANTS_DB, ADMIN_PIN } from '../config/participants'

export const validateParticipant = (name, password) => {
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
