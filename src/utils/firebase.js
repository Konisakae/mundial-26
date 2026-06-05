import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import bcrypt from 'bcryptjs'

const firebaseConfig = {
  apiKey: "AIzaSyDQlrP7fX6staH67NOiql32-BJdQADkiCE",
  authDomain: "mundial-26-los-ropers.firebaseapp.com",
  projectId: "mundial-26-los-ropers",
  storageBucket: "mundial-26-los-ropers.firebasestorage.app",
  messagingSenderId: "648258874292",
  appId: "1:648258874292:web:b41e5f98b5cf2edf1020e1"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Save data to Firestore
export const saveToFirestore = async (collection, docId, data) => {
  try {
    await setDoc(doc(db, collection, docId), data, { merge: true })
    console.log(`[Firebase] Saved to ${collection}/${docId}`)
    return true
  } catch (err) {
    console.error(`[Firebase] Failed to save to ${collection}/${docId}:`, err.message)
    return false
  }
}

// Load data from Firestore
export const loadFromFirestore = async (collection, docId) => {
  try {
    const docSnap = await getDoc(doc(db, collection, docId))
    if (docSnap.exists()) {
      console.log(`[Firebase] Loaded ${collection}/${docId}`)
      return docSnap.data()
    }
    return null
  } catch (err) {
    console.error(`[Firebase] Failed to load from ${collection}/${docId}:`, err.message)
    return null
  }
}

// Hash password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10)
}

// Compare password with hash
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

// Initialize participant in Firestore (only if doesn't exist)
export const initializeParticipant = async (name, password) => {
  try {
    const existing = await getDoc(doc(db, 'participants', name))
    if (existing.exists()) {
      console.log(`[Firebase] Participant ${name} already exists`)
      return
    }

    const hashedPassword = await hashPassword(password)
    await setDoc(doc(db, 'participants', name), {
      name,
      passwordHash: hashedPassword,
      createdAt: new Date()
    })
    console.log(`[Firebase] Initialized participant ${name}`)
  } catch (err) {
    console.error(`[Firebase] Failed to initialize ${name}:`, err.message)
  }
}

// Subscribe to real-time updates for actuals
export const subscribeToActuals = (callback) => {
  try {
    const unsubscribe = onSnapshot(doc(db, 'app_data', 'wc26_actuals'), (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data().value || {})
      }
    }, (err) => {
      console.error(`[Firebase] Error subscribing to actuals:`, err.message)
    })
    return unsubscribe
  } catch (err) {
    console.error(`[Firebase] Failed to subscribe to actuals:`, err.message)
    return () => {}
  }
}
