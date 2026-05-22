// Wrappers sobre localStorage con manejo de errores

const get = (key, fallback = null) => {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch { return fallback }
}

const set = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export const storage = { get, set }
