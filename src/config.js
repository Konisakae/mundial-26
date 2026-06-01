// Admin PIN - puede ser sobrescrito por variable de entorno
export const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '2026'

// Códigos de participantes - todos usan el mismo código por ahora
export const PARTICIPANT_CODES = {
  'Lucía': '1234',
  'Olivia': '1234',
  'Eva': '1234',
  'Pablo N.': '1234',
  'Lucas': '1234',
  'Darío': '1234',
  'Elena': '1234',
  'Javi': '1234',
  'Nic': '1234',
  'Jose M.': '1234',
  'Charo': '1234',
  'Abuelo': '1234'
}

// Tiempo de cierre antes del partido (en minutos)
export const LOCKOUT_MINUTES = 5
