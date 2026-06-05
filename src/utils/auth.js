import { getDoc, doc } from 'firebase/firestore'
import { comparePassword, db } from './firebase'
import { ADMIN_PIN } from '../config/participants'

// Validate participant - checks against Firestore
export const validateParticipant = async (name, password) => {
  try {
    const participantDoc = await getDoc(doc(db, 'participants', name))
    if (!participantDoc.exists()) {
      console.log(`[Auth] Participant ${name} not found`)
      return false
    }

    const { passwordHash } = participantDoc.data()
    const isValid = await comparePassword(password, passwordHash)
    console.log(`[Auth] Validation for ${name}: ${isValid ? 'success' : 'failed'}`)
    return isValid
  } catch (err) {
    console.error(`[Auth] Failed to validate participant:`, err.message)
    return false
  }
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
