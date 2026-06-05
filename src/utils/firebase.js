import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

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
