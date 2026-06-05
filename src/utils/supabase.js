import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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
