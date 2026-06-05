import { loadFromFirestore, saveToFirestore } from './firebase'

// Synchronous localStorage for backward compatibility
const get = (key, fallback = null) => {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch { return fallback }
}

const set = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`[Storage] Failed to write '${key}':`, err.message)
  }
}

// Async versions using Firestore with localStorage priority
export const getAsync = async (key, fallback = null) => {
  // Priority 1: localStorage (instant)
  const localData = get(key, null)
  if (localData !== null) {
    return localData
  }

  // Priority 2: Firestore (in background, don't wait)
  try {
    const data = await loadFromFirestore('app_data', key)
    if (data && data.value) {
      set(key, data.value) // Update localStorage
      return data.value
    }
  } catch (err) {
    console.error(`[Storage] Failed to read from Firestore '${key}':`, err.message)
  }

  return fallback
}

export const setAsync = async (key, value) => {
  // Always save to localStorage first (instant)
  set(key, value)

  // Then try Firestore in background (don't wait)
  saveToFirestore('app_data', key, { value }).catch(err => {
    console.error(`[Storage] Failed to write to Firestore '${key}':`, err.message)
  })
}

// Migrar formato antiguo de predicciones al nuevo
// Formato antiguo: { "Participant": { [matchId]: { h, a }, ... } }
// Formato nuevo: { "Participant": { predictions: {...}, confirmed: {1: false, 2: false, 3: false} } }
const migrateOldFormat = (oldData) => {
  if (!oldData || typeof oldData !== 'object') return {}

  const newData = {}

  for (const [participantName, participantData] of Object.entries(oldData)) {
    // Si ya tiene estructura nueva (tiene 'predictions' y 'confirmed'), no migrar
    if (participantData.predictions && participantData.confirmed) {
      newData[participantName] = participantData
      continue
    }

    // Si tiene estructura antigua (es un objeto con matchIds directamente), migrar
    const predictions = {}
    const confirmed = { 1: false, 2: false, 3: false }

    for (const [key, value] of Object.entries(participantData)) {
      if (value && typeof value === 'object' && (value.h !== undefined || value.a !== undefined)) {
        predictions[key] = value
      }
    }

    newData[participantName] = { predictions, confirmed }
  }

  return newData
}

// Asegurar que la estructura de predicciones es nueva
// Si es formato antiguo, migrar
// Si es nueva, devolver como está
const ensureNewFormat = (predictions) => {
  if (!predictions) return {}

  // Detectar si es formato antiguo checando el primer participante
  const firstParticipant = Object.values(predictions)[0]
  if (firstParticipant && !firstParticipant.predictions) {
    // Es formato antiguo, migrar
    return migrateOldFormat(predictions)
  }

  return predictions
}

// Obtener estructura de predicciones para un participante asegurando que tenga la estructura nueva
const getPredictionsStructure = (participant, allPredictions = {}) => {
  if (!allPredictions[participant]) {
    return {
      predictions: {},
      confirmed: { 1: false, 2: false, 3: false }
    }
  }

  const data = allPredictions[participant]

  // Si ya tiene estructura nueva, devolverla
  if (data.predictions && data.confirmed) {
    return data
  }

  // Si tiene estructura antigua, convertir
  const predictions = {}
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && (value.h !== undefined || value.a !== undefined)) {
      predictions[key] = value
    }
  }

  return {
    predictions,
    confirmed: { 1: false, 2: false, 3: false }
  }
}

export const storage = { get, set, ensureNewFormat, getPredictionsStructure, migrateOldFormat }
