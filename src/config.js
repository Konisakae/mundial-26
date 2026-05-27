// Admin PIN - puede ser sobrescrito por variable de entorno
export const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '2026'

// Códigos de participantes - cada participante tiene su propio código
export const PARTICIPANT_CODES = {
  'Laura': '1234',
  'Lucía': '5678',
  'Olivia': '9012',
  'Eva': '3456',
  'Pablo N.': '7890',
  'Lucas': '2345',
  'Darío': '6789',
  'Elena': '0123',
  'Javi': '4567',
  'Nic': '8901',
  'Jose M.': '1357',
  'Charo': '2468',
  'Abuelo': '3579'
}

// Tiempo de cierre antes del partido (en minutos)
export const LOCKOUT_MINUTES = 5
