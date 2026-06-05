// Script one-time para inicializar participantes en Supabase
// Ejecutar: npx tsx src/utils/initSupabase.js

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Participantes y contraseñas (hardcodeado para este script)
const PARTICIPANTS_DATA = {
  'Lucía': '1234',
  'Olivia': '5678',
  'Eva': '9012',
  'Pablo': '3456',
  'Lucas': '7890',
  'Darío': '2345',
  'Elena': '6789',
  'Javi': '0123',
  'Nic': '4567',
  'Jose': '8901',
  'Charo': '2468',
  'Abuelo': '1357'
}

async function initParticipants() {
  console.log('🔄 Inicializando participantes en Supabase...')

  const participants = []

  // Hash todas las contraseñas
  for (const [name, password] of Object.entries(PARTICIPANTS_DATA)) {
    const passwordHash = await bcrypt.hash(password, 10)
    participants.push({
      name,
      password_hash: passwordHash
    })
  }

  console.log(`📝 Insertando ${participants.length} participantes...`)

  const { data, error } = await supabase
    .from('participants')
    .insert(participants)

  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  console.log('✅ Participantes inicializados correctamente')
  console.log(`✅ ${participants.length} filas insertadas`)
  process.exit(0)
}

initParticipants()
