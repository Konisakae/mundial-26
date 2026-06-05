import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Supabase environment variables not configured!\n' +
    'Please add to Vercel:\n' +
    '  VITE_SUPABASE_URL\n' +
    '  VITE_SUPABASE_ANON_KEY\n' +
    'Or create .env.local for local development'
  )
  throw new Error('Supabase configuration missing')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Get participant by name
export async function getParticipantByName(name) {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('name', name)
    .single()
  return { data, error }
}

// Get all participants
export async function getAllParticipants() {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('name')
  return { data, error }
}

// Get all predictions for a participant
export async function getPredictionsByParticipant(participantId) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('participant_id', participantId)
  return { data, error }
}

// Get all actuals (match results)
export async function getAllActuals() {
  const { data, error } = await supabase
    .from('actuals')
    .select('*')
  return { data, error }
}

// Save prediction
export async function savePrediction(participantId, matchId, homeScore, awayScore, predictedWinner = null) {
  const { data, error } = await supabase
    .from('predictions')
    .upsert({
      participant_id: participantId,
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      predicted_winner: predictedWinner,
      updated_at: new Date()
    })
  return { data, error }
}

// Save actual result
export async function saveActual(matchId, homeScore, awayScore, winner = null) {
  const { data, error } = await supabase
    .from('actuals')
    .upsert({
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      winner: winner,
      updated_at: new Date()
    })
  return { data, error }
}

// Get confirmations
export async function getConfirmations() {
  const { data, error } = await supabase
    .from('confirmations')
    .select('*')
  return { data, error }
}

// Save confirmation
export async function saveConfirmation(phaseOrJornada) {
  const { data, error } = await supabase
    .from('confirmations')
    .upsert({
      phase_or_jornada: phaseOrJornada,
      confirmed_at: new Date()
    })
  return { data, error }
}

// Get R16 substitutions
export async function getR16Substitutions() {
  const { data, error } = await supabase
    .from('r16_substitutions')
    .select('*')
  return { data, error }
}

// Save R16 substitutions
export async function saveR16Substitutions(substitutions) {
  const rows = Object.entries(substitutions).map(([slot, team]) => ({
    slot_identifier: slot,
    team_code: team
  }))

  const { data, error } = await supabase
    .from('r16_substitutions')
    .upsert(rows)
  return { data, error }
}

// Get simulations state
export async function getSimulations() {
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
  return { data: data?.[0], error }
}

// Save simulations state
export async function saveSimulations(state) {
  const { data, error } = await supabase
    .from('simulations')
    .upsert({
      jornada_1: state.jornada_1 || false,
      jornada_2: state.jornada_2 || false,
      jornada_3: state.jornada_3 || false,
      phase_r16: state.phase_r16 || false,
      phase_oct: state.phase_oct || false,
      phase_cto: state.phase_cto || false,
      phase_semi: state.phase_semi || false,
      phase_tercerp: state.phase_tercerp || false,
      phase_fin: state.phase_fin || false,
      updated_at: new Date()
    })
  return { data, error }
}

// ============ BULK LOAD/SAVE FUNCTIONS ============

// Load all app data from Supabase
export async function loadAllDataFromSupabase() {
  try {
    const [
      { data: allPredictions, error: predError },
      { data: allActuals, error: actualError },
      { data: confirmations, error: confError },
      { data: simulations, error: simError }
    ] = await Promise.all([
      supabase.from('predictions').select('*'),
      supabase.from('actuals').select('*'),
      supabase.from('confirmations').select('*'),
      supabase.from('simulations').select('*').order('updated_at', { ascending: false }).limit(1)
    ])

    if (predError || actualError || confError || simError) {
      console.error('[Supabase] Load error:', { predError, actualError, confError, simError })
      return null
    }

    return {
      predictions: allPredictions,
      actuals: allActuals,
      confirmations: confirmations,
      simulations: simulations?.[0]
    }
  } catch (err) {
    console.error('[Supabase] Failed to load data:', err.message)
    return null
  }
}

// Save actual result to Supabase
export async function saveActualToSupabase(matchId, homeScore, awayScore, winner = null) {
  return await saveActual(matchId, homeScore, awayScore, winner)
}

// Save prediction to Supabase
export async function savePredictionToSupabase(participantId, matchId, homeScore, awayScore, predictedWinner = null) {
  return await savePrediction(participantId, matchId, homeScore, awayScore, predictedWinner)
}

// Save prediction by participant name (simplified version that stores name instead of UUID)
export async function savePredictionByName(participantName, matchId, homeScore, awayScore, predictedWinner = null) {
  const { data, error } = await supabase
    .from('predictions')
    .upsert({
      participant_name: participantName,
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      predicted_winner: predictedWinner,
      updated_at: new Date()
    })
  return { data, error }
}
