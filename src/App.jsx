import { useState, useEffect } from 'react'
import { DEFAULT_PARTICIPANTS } from './data/teams'
import { MATCHES } from './data/matches'
import { calcTotalPts } from './utils/scoring'
import { storage, getAsync, setAsync } from './utils/storage'
import { getAllGroupWinners } from './utils/groupStandings'
import { getSession } from './utils/auth'
import { initializeParticipant } from './utils/firebase'
import Header from './components/Header'
import Resultados from './components/Resultados'
import Apuestas from './components/Apuestas'
import EditarApuestas from './components/EditarApuestas'
import Clasificacion from './components/Clasificacion'
import Grupos from './components/Grupos'
import Todas from './components/Todas'
import Evolucion from './components/Evolucion'
import styles from './styles/App.module.css'

export default function App() {
  const [tab, setTab] = useState('resultados')
  const [phase, setPhase] = useState('G')
  const [group, setGroup] = useState('A')
  const [participant, setParticipant] = useState('')
  const [participants, setParticipants] = useState([])
  const [predictions, setPredictions] = useState({})
  const [actuals, setActuals] = useState({})
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedParticipantForEditing, setSelectedParticipantForEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simulatedJornadas, setSimulatedJornadas] = useState({ 1: false, 2: false, 3: false })
  const [simulatedPhases, setSimulatedPhases] = useState({ R16: false, OCT: false, CTO: false, SEMI: false, '3P': false, FIN: false })
  const [r16Substitutions, setR16Substitutions] = useState({})
  const [octavosSubstitutions, setOctavosSubstitutions] = useState({})
  const [octavosGroupInfo, setOctavosGroupInfo] = useState({})
  const [cuartosSubstitutions, setCuartosSubstitutions] = useState({})
  const [cuartosGroupInfo, setCuartosGroupInfo] = useState({})
  const [semifinalSubstitutions, setSemifinalSubstitutions] = useState({})
  const [semifinalGroupInfo, setSemifinalGroupInfo] = useState({})
  const [tercerPuestoSubstitutions, setTercerPuestoSubstitutions] = useState({})
  const [tercerPuestoGroupInfo, setTercerPuestoGroupInfo] = useState({})
  const [finalSubstitutions, setFinalSubstitutions] = useState({})
  const [finalGroupInfo, setFinalGroupInfo] = useState({})
  const [r16Confirmed, setR16Confirmed] = useState(false)
  const [selectedThirds, setSelectedThirds] = useState({})
  const [resultsConfirmed, setResultsConfirmed] = useState({ 1: false, 2: false, 3: false, R16: false, OCT: false, CTO: false, SEMI: false, '3P': false, FIN: false })
  const [r16MatchupsConfirmed, setR16MatchupsConfirmed] = useState(false)

  useEffect(() => {
    const parts = DEFAULT_PARTICIPANTS
    setParticipants(parts)
    // Sync to Firestore in background (non-blocking)
    setAsync('wc26_participants', parts)

    // Load from localStorage only (instant, don't wait for Firestore)
    let preds = storage.get('wc26_predictions', {})
    preds = storage.ensureNewFormat(preds)
    const acts = storage.get('wc26_actuals', {})
    const simJornadas = storage.get('wc26_simulatedJornadas', { 1: false, 2: false, 3: false })
    const simPhases = storage.get('wc26_simulatedPhases', { R16: false, OCT: false, CTO: false, SEMI: false, '3P': false, FIN: false })
    const subs = storage.get('wc26_r16Substitutions', {})
    const octSubs = storage.get('wc26_octavosSubstitutions', {})
    const octGroupInfo = storage.get('wc26_octavosGroupInfo', {})
    const ctoSubs = storage.get('wc26_cuartosSubstitutions', {})
    const ctoGroupInfo = storage.get('wc26_cuartosGroupInfo', {})
    const semiSubs = storage.get('wc26_semifinalSubstitutions', {})
    const semiGroupInfo = storage.get('wc26_semifinalGroupInfo', {})
    const tercerSubs = storage.get('wc26_tercerPuestoSubstitutions', {})
    const tercerGroupInfo = storage.get('wc26_tercerPuestoGroupInfo', {})
    const finalSubs = storage.get('wc26_finalSubstitutions', {})
    const finalGroupInfo = storage.get('wc26_finalGroupInfo', {})
    const r16Conf = storage.get('wc26_r16Confirmed', false)
    const selThirds = storage.get('wc26_selectedThirds', {})
    const resConfirmed = storage.get('wc26_resultsConfirmed', { 1: false, 2: false, 3: false, R16: false, OCT: false, CTO: false, SEMI: false, '3P': false, FIN: false })
    const r16MatchConf = storage.get('wc26_r16MatchupsConfirmed', false)

    setPredictions(preds)
    setActuals(acts)
    setSimulatedJornadas(simJornadas)
    setSimulatedPhases(simPhases)
    setR16Substitutions(subs)
    setOctavosSubstitutions(octSubs)
    setOctavosGroupInfo(octGroupInfo)
    setCuartosSubstitutions(ctoSubs)
    setCuartosGroupInfo(ctoGroupInfo)
    setSemifinalSubstitutions(semiSubs)
    setSemifinalGroupInfo(semiGroupInfo)
    setTercerPuestoSubstitutions(tercerSubs)
    setTercerPuestoGroupInfo(tercerGroupInfo)
    setFinalSubstitutions(finalSubs)
    setFinalGroupInfo(finalGroupInfo)
    setR16Confirmed(r16Conf)
    setSelectedThirds(selThirds)
    setResultsConfirmed(resConfirmed)
    setR16MatchupsConfirmed(r16MatchConf)
    setLoading(false)

    // Si todas las jornadas están simuladas, generar R16 substituciones
    if (simJornadas[1] && simJornadas[2] && simJornadas[3] && Object.keys(subs).length === 0) {
      const groupWinners = getAllGroupWinners(acts)
      const newSubs = {}
      Object.entries(groupWinners).forEach(([group, winners]) => {
        if (winners.first) newSubs[`1.º ${group}`] = winners.first
        if (winners.second) newSubs[`2.º ${group}`] = winners.second
      })
      if (Object.keys(newSubs).length > 0) {
        setR16Substitutions(newSubs)
        setAsync('wc26_r16Substitutions', newSubs)
      }
    }

    // Restaurar sesión si existe
    const session = getSession()
    if (session) {
      if (session.type === 'admin') setIsAdmin(true)
      if (session.type === 'participant') setParticipant(session.user)
    }

    // Sync from Firestore in background (only once on mount, no loops)
    getAsync('wc26_actuals', {}).then(fbActuals => {
      if (fbActuals && Object.keys(fbActuals).length > 0) {
        setActuals(fbActuals)
      }
    })

    getAsync('wc26_predictions', {}).then(fbPreds => {
      if (fbPreds && Object.keys(fbPreds).length > 0) {
        setPredictions(storage.ensureNewFormat(fbPreds))
      }
    })

    // Sync confirmations from Firestore
    getAsync('wc26_resultsConfirmed', resConfirmed).then(fbConfirmed => {
      if (fbConfirmed && Object.keys(fbConfirmed).length > 0) {
        setResultsConfirmed(fbConfirmed)
      }
    })

    getAsync('wc26_selectedThirds', selThirds).then(fbThirds => {
      if (fbThirds && Object.keys(fbThirds).length > 0) {
        setSelectedThirds(fbThirds)
      }
    })

    getAsync('wc26_r16Substitutions', subs).then(fbSubs => {
      if (fbSubs && Object.keys(fbSubs).length > 0) {
        setR16Substitutions(fbSubs)
      }
    })

    getAsync('wc26_r16MatchupsConfirmed', r16MatchConf).then(fbR16Match => {
      if (fbR16Match) {
        setR16MatchupsConfirmed(fbR16Match)
      }
    })

    getAsync('wc26_r16Confirmed', r16Conf).then(fbR16Conf => {
      if (fbR16Conf) {
        setR16Confirmed(fbR16Conf)
      }
    })
  }, [])

  // Initialize participants in Firestore (only once)
  useEffect(() => {
    const hasInitialized = localStorage.getItem('wc26_participants_initialized')
    if (hasInitialized) return

    const initializeParticipants = async () => {
      const parts = DEFAULT_PARTICIPANTS
      for (const part of parts) {
        const defaultPassword = '1234'
        await initializeParticipant(part, defaultPassword)
      }
      console.log('[App] Participants initialized in Firestore')
      localStorage.setItem('wc26_participants_initialized', 'true')
    }

    initializeParticipants()
  }, [])

  // Data sync strategy:
  // - All changes save to localStorage immediately (responsive)
  // - All changes save to Supabase in background (async, non-blocking)
  // - We read from localStorage for display (always up-to-date locally)
  // - Supabase is backup/sync for other browsers (refresh page to sync)
  // No auto-polling or auto-load to avoid overwriting local edits

  const savePred = (matchIdOrParticipant, hOrMatchId, aOrH, a) => {
    // Soporta dos firmas: savePred(matchId, h, a) o savePred(participant, matchId, h, a)
    let targetParticipant, matchId, h, actualA

    // Si el primer arg es string (participante), es la segunda forma
    if (typeof matchIdOrParticipant === 'string') {
      // Segunda forma: savePred(participant, matchId, h, a)
      targetParticipant = matchIdOrParticipant
      matchId = hOrMatchId
      h = aOrH
      actualA = a
    } else {
      // Primera forma: savePred(matchId, h, a)
      targetParticipant = participant
      matchId = matchIdOrParticipant
      h = hOrMatchId
      actualA = aOrH
    }

    if (!targetParticipant) return
    const next = {
      ...predictions,
      [targetParticipant]: {
        predictions: {
          ...(predictions[targetParticipant]?.predictions || {}),
          [matchId]: { h, a: actualA },
        },
        confirmed: predictions[targetParticipant]?.confirmed || { 1: false, 2: false, 3: false },
      },
    }
    setPredictions(next)
    setAsync('wc26_predictions', next)
  }

  const saveActual = (matchId, h, a) => {
    const next = { ...actuals }
    if (h === undefined || a === undefined) {
      delete next[matchId]
    } else {
      next[matchId] = { ...next[matchId], h, a }
    }
    setActuals(next)
    setAsync('wc26_actuals', next)

    // Generar R16 automáticamente si hay 72 resultados (sin importar si fueron simulados o manuales)
    const resultCount = Object.values(next).filter(a => a?.h !== undefined).length
    if (resultCount === 72) {
      const groupWinners = getAllGroupWinners(next)
      const newSubs = {}
      Object.entries(groupWinners).forEach(([group, winners]) => {
        if (winners.first) newSubs[`1.º ${group}`] = winners.first
        if (winners.second) newSubs[`2.º ${group}`] = winners.second
      })
      setR16Substitutions(newSubs)
      setAsync('wc26_r16Substitutions', newSubs)
    }
  }

  const setWinner = (matchId, winner) => {
    const next = { ...actuals }
    if (!next[matchId]) {
      console.warn(`[setWinner] Match ${matchId} has no result yet, cannot set winner`)
      return
    }
    next[matchId] = { ...next[matchId], winner: winner || undefined }
    console.log(`[setWinner] Match ${matchId}: saving winner=${winner}`, next[matchId])
    setActuals(next)
    setAsync('wc26_actuals', next).catch(err => {
      console.error(`[setWinner] Failed to save winner for match ${matchId}:`, err)
    })
  }

  const setPredictedWinner = (matchId, winner, targetParticipant = null) => {
    const targetPart = targetParticipant || participant
    if (!targetPart) return
    const next = {
      ...predictions,
      [targetPart]: {
        predictions: {
          ...(predictions[targetPart]?.predictions || {}),
          [matchId]: {
            ...(predictions[targetPart]?.predictions[matchId] || {}),
            winner: winner || undefined
          }
        },
        confirmed: predictions[targetPart]?.confirmed || { 1: false, 2: false, 3: false },
      },
    }
    setPredictions(next)
    setAsync('wc26_predictions', next)
  }

  const addParticipant = (name) => {
    if (!name || participants.includes(name)) return
    const next = [...participants, name]
    setParticipants(next)
    setParticipant(name)
    setAsync('wc26_participants', next)
  }

  // Obtener jornada actual (primera no confirmada)
  const getCurrentJornada = (part) => {
    const confirmed = predictions[part]?.confirmed || { 1: false, 2: false, 3: false }
    if (!confirmed[1]) return 1
    if (!confirmed[2]) return 2
    if (!confirmed[3]) return 3
    return 3 // Si todas están confirmadas, devolver 3
  }

  // Confirmar jornada de un participante
  const confirmJornada = (part, jornada) => {
    if (!part) return
    const next = {
      ...predictions,
      [part]: {
        predictions: predictions[part]?.predictions || {},
        confirmed: {
          ...(predictions[part]?.confirmed || { 1: false, 2: false, 3: false }),
          [jornada]: true,
        },
      },
    }
    setPredictions(next)
    setAsync('wc26_predictions', next)
  }

  const confirmR16Prediction = (part) => {
    if (!part) return
    const next = {
      ...predictions,
      [part]: {
        predictions: predictions[part]?.predictions || {},
        confirmed: {
          ...(predictions[part]?.confirmed || { 1: false, 2: false, 3: false }),
          'R16': true,
        },
      },
    }
    setPredictions(next)
    setAsync('wc26_predictions', next)
  }

  const confirmEliminationPhase = (part, phase) => {
    if (!part) return
    const next = {
      ...predictions,
      [part]: {
        predictions: predictions[part]?.predictions || {},
        confirmed: {
          ...(predictions[part]?.confirmed || { 1: false, 2: false, 3: false }),
          [phase]: true,
        },
      },
    }
    setPredictions(next)
    setAsync('wc26_predictions', next)
  }

  // Confirmar resultados de una jornada o fase
  const confirmResults = (jornadaOrPhase) => {
    const next = { ...resultsConfirmed, [jornadaOrPhase]: true }
    setResultsConfirmed(next)
    setAsync('wc26_resultsConfirmed', next)
  }

  // Confirmar enfrentamientos de R16
  const confirmR16Matchups = () => {
    setR16MatchupsConfirmed(true)
    setAsync('wc26_r16MatchupsConfirmed', true)
  }

  // Simular datos de una jornada específica
  const simulate = (jornada) => {
    if (jornada < 1 || jornada > 3) return

    // Determinar rango de partidos según jornada
    const minMatchId = (jornada - 1) * 24 + 1
    const maxMatchId = jornada * 24

    const matchesToSimulate = MATCHES.filter(m => m.ph === 'G' && m.id >= minMatchId && m.id <= maxMatchId)

    // Generar resultados reales simulados
    const newActuals = { ...actuals }
    matchesToSimulate.forEach(m => {
      newActuals[m.id] = {
        h: Math.floor(Math.random() * 4),
        a: Math.floor(Math.random() * 4)
      }
    })

    // Generar predicciones para todos los participantes
    const newPreds = { ...predictions }
    participants.forEach(p => {
      const pData = newPreds[p] || { predictions: {}, confirmed: { 1: false, 2: false, 3: false } }
      matchesToSimulate.forEach(m => {
        pData.predictions[m.id] = {
          h: Math.floor(Math.random() * 4),
          a: Math.floor(Math.random() * 4)
        }
      })
      // Preservar confirmaciones anteriores, no sobrescribir
      newPreds[p] = {
        predictions: pData.predictions,
        confirmed: pData.confirmed || { 1: false, 2: false, 3: false }
      }
    })

    // Marcar jornada como simulada
    const newSimJornadas = { ...simulatedJornadas, [jornada]: true }

    setActuals(newActuals)
    setPredictions(newPreds)
    setSimulatedJornadas(newSimJornadas)

    setAsync('wc26_actuals', newActuals)
    setAsync('wc26_predictions', newPreds)
    setAsync('wc26_simulatedJornadas', newSimJornadas)
  }

  // Simular dieciseisavos cuando todos los terceros estén seleccionados
  const simulate16 = () => {
    const selectedGroupCount = Object.keys(selectedThirds).length
    if (selectedGroupCount < 8) return

    // Obtener los 16 partidos de dieciseisavos
    const r16Matches = MATCHES.filter(m => m.ph === 'R16' && m.id >= 73 && m.id <= 88)

    // Generar resultados reales simulados (pueden tener empates)
    const newActuals = { ...actuals }
    r16Matches.forEach(m => {
      newActuals[m.id] = {
        h: Math.floor(Math.random() * 4),
        a: Math.floor(Math.random() * 4)
      }
    })

    // Generar predicciones para todos los participantes sin empates
    const newPreds = { ...predictions }
    participants.forEach(p => {
      const pData = newPreds[p] || { predictions: {}, confirmed: { 1: false, 2: false, 3: false } }
      r16Matches.forEach(m => {
        pData.predictions[m.id] = generateNoDrawScore()
      })
      // Preservar confirmaciones anteriores, no sobrescribir
      newPreds[p] = {
        predictions: pData.predictions,
        confirmed: pData.confirmed || { 1: false, 2: false, 3: false }
      }
    })

    setActuals(newActuals)
    setPredictions(newPreds)

    const newPhases = { ...simulatedPhases, R16: true }
    setSimulatedPhases(newPhases)

    setAsync('wc26_actuals', newActuals)
    setAsync('wc26_predictions', newPreds)
    setAsync('wc26_simulatedPhases', newPhases)
  }

  // Función helper para generar score sin empate
  const generateNoDrawScore = () => {
    let h, a
    do {
      h = Math.floor(Math.random() * 4)
      a = Math.floor(Math.random() * 4)
    } while (h === a)
    return { h, a }
  }

  // Función genérica para simular fase eliminatoria
  const simulateElimination = (phaseName) => {
    const phaseMatches = MATCHES.filter(m => m.ph === phaseName)
    if (phaseMatches.length === 0) return

    // Generar resultados reales
    const newActuals = { ...actuals }
    phaseMatches.forEach(m => {
      newActuals[m.id] = {
        h: Math.floor(Math.random() * 4),
        a: Math.floor(Math.random() * 4)
      }
    })

    // Generar predicciones sin empates
    const newPreds = { ...predictions }
    participants.forEach(p => {
      const pData = newPreds[p] || { predictions: {}, confirmed: { 1: false, 2: false, 3: false } }
      phaseMatches.forEach(m => {
        const score = generateNoDrawScore()
        pData.predictions[m.id] = score
      })
      // Preservar confirmaciones anteriores, no sobrescribir
      newPreds[p] = {
        predictions: pData.predictions,
        confirmed: pData.confirmed || { 1: false, 2: false, 3: false }
      }
    })

    setActuals(newActuals)
    setPredictions(newPreds)

    setAsync('wc26_actuals', newActuals)
    setAsync('wc26_predictions', newPreds)
  }

  const simulateOctavos = () => {
    if (!simulatedPhases?.R16) return
    simulateElimination('OCT')
    const newPhases = { ...simulatedPhases, OCT: true }
    setSimulatedPhases(newPhases)
    setAsync('wc26_simulatedPhases', newPhases)
  }

  const simulateCuartos = () => {
    if (!simulatedPhases?.OCT) return
    simulateElimination('CTO')
    const newPhases = { ...simulatedPhases, CTO: true }
    setSimulatedPhases(newPhases)
    setAsync('wc26_simulatedPhases', newPhases)
  }

  const simulateSemis = () => {
    if (!simulatedPhases?.CTO) return
    simulateElimination('SEMI')
    const newPhases = { ...simulatedPhases, SEMI: true }
    setSimulatedPhases(newPhases)
    setAsync('wc26_simulatedPhases', newPhases)
  }

  const simulateThirdPlace = () => {
    if (!simulatedPhases?.SEMI) return
    simulateElimination('3P')
    const newPhases = { ...simulatedPhases, '3P': true }
    setSimulatedPhases(newPhases)
    setAsync('wc26_simulatedPhases', newPhases)
  }

  const simulateFinal = () => {
    if (!simulatedPhases?.SEMI) return
    simulateElimination('FIN')
    const newPhases = { ...simulatedPhases, FIN: true }
    setSimulatedPhases(newPhases)
    setAsync('wc26_simulatedPhases', newPhases)
  }

  // Validar automáticamente ganadores cuando todas las jornadas estén simuladas
  useEffect(() => {
    if (simulatedJornadas[1] && simulatedJornadas[2] && simulatedJornadas[3]) {
      generateR16Matches()
    }
  }, [simulatedJornadas])

  // Consolidated useEffect: Generate elimination matches in sequence when actuals change
  // This prevents race conditions from multiple parallel writes
  useEffect(() => {
    // Generate R16 if all groups completed
    if (simulatedJornadas[1] && simulatedJornadas[2] && simulatedJornadas[3]) {
      const r16Matches = MATCHES.filter(m => m.ph === 'R16')
      const r16Completed = r16Matches.every(m => actuals[m.id]?.h !== undefined && actuals[m.id]?.a !== undefined && actuals[m.id]?.h !== '' && actuals[m.id]?.a !== '')

      if (r16Completed && Object.keys(r16Substitutions).length > 0) {
        generateOctavosMatches(r16Substitutions, selectedThirds, availableThirds, actuals)
      }

      // Generate Octavos if R16 completed
      const octavosMatches = MATCHES.filter(m => m.ph === 'OCT')
      const octavosCompleted = octavosMatches.length > 0 && octavosMatches.every(m => actuals[m.id]?.h !== undefined && actuals[m.id]?.a !== undefined && actuals[m.id]?.h !== '' && actuals[m.id]?.a !== '')

      if (octavosCompleted && Object.keys(octavosSubstitutions).length > 0) {
        generateCuartosMatches(octavosSubstitutions, actuals, octavosGroupInfo)
      }

      // Generate Cuartos if Octavos completed
      const cuartosMatches = MATCHES.filter(m => m.ph === 'CTO')
      const cuartosCompleted = cuartosMatches.length > 0 && cuartosMatches.every(m => actuals[m.id]?.h !== undefined && actuals[m.id]?.a !== undefined && actuals[m.id]?.h !== '' && actuals[m.id]?.a !== '')

      if (cuartosCompleted && Object.keys(cuartosSubstitutions).length > 0) {
        generateSemifinalMatches(cuartosSubstitutions, actuals, cuartosGroupInfo)
      }

      // Generate Semis and Final if Cuartos completed
      const semiMatches = MATCHES.filter(m => m.ph === 'SEMI')
      const semiCompleted = semiMatches.length > 0 && semiMatches.every(m => actuals[m.id]?.h !== undefined && actuals[m.id]?.a !== undefined && actuals[m.id]?.h !== '' && actuals[m.id]?.a !== '')

      if (semiCompleted && Object.keys(semifinalSubstitutions).length > 0) {
        generateFinalMatches(semifinalSubstitutions, actuals, semifinalGroupInfo)
      }
    }

    // Regenerar R16 cuando se accede a la fase R16 por primera vez
    if (phase === 'R16') {
      const resultCount = Object.values(actuals).filter(a => a?.h !== undefined).length
      if (resultCount >= 72 && Object.keys(r16Substitutions).length < 12) {
        const groupWinners = getAllGroupWinners(actuals)
        const newSubs = { ...r16Substitutions }
        Object.entries(groupWinners).forEach(([group, winners]) => {
          if (winners.first) newSubs[`1.º ${group}`] = winners.first
          if (winners.second) newSubs[`2.º ${group}`] = winners.second
        })
        setR16Substitutions(newSubs)
        setAsync('wc26_r16Substitutions', newSubs)
      }
    }
  }, [actuals, simulatedJornadas, phase])

  // Borrar todos los datos simulados
  const clearAllData = () => {
    if (!window.confirm('¿Borrar toda la simulación? No se puede deshacer.')) return

    setActuals({})
    setPredictions({})
    setSimulatedJornadas({ 1: false, 2: false, 3: false })
    setR16Substitutions({})
    setOctavosSubstitutions({})
    setOctavosGroupInfo({})
    setCuartosSubstitutions({})
    setCuartosGroupInfo({})
    setSemifinalSubstitutions({})
    setSemifinalGroupInfo({})
    setTercerPuestoSubstitutions({})
    setTercerPuestoGroupInfo({})
    setFinalSubstitutions({})
    setFinalGroupInfo({})
    setSelectedThirds({})

    setAsync('wc26_actuals', {})
    setAsync('wc26_predictions', {})
    setAsync('wc26_simulatedJornadas', { 1: false, 2: false, 3: false })
    setAsync('wc26_r16Substitutions', {})
    setAsync('wc26_octavosSubstitutions', {})
    setAsync('wc26_octavosGroupInfo', {})
    setAsync('wc26_cuartosSubstitutions', {})
    setAsync('wc26_cuartosGroupInfo', {})
    setAsync('wc26_semifinalSubstitutions', {})
    setAsync('wc26_semifinalGroupInfo', {})
    setAsync('wc26_tercerPuestoSubstitutions', {})
    setAsync('wc26_tercerPuestoGroupInfo', {})
    setAsync('wc26_finalSubstitutions', {})
    setAsync('wc26_finalGroupInfo', {})
    setAsync('wc26_selectedThirds', {})
  }

  // Confirmar terceros lugares seleccionados y generar dieciseisavos
// Generar automáticamente partidos de dieciseisavos cuando grupos estén listos
  const generateR16Matches = () => {
    if (Object.values(actuals).filter(a => a?.h !== undefined).length < 72) return

    const groupWinners = getAllGroupWinners(actuals)

    // Crear mapeo de substituciones para referencias en dieciseisavos
    const subs = {}
    Object.entries(groupWinners).forEach(([group, winners]) => {
      if (winners.first) subs[`1.º ${group}`] = winners.first
      if (winners.second) subs[`2.º ${group}`] = winners.second
    })

    setR16Substitutions(subs)
    setAsync('wc26_r16Substitutions', subs)
  }

  const confirmR16 = () => {
    generateOctavosMatches(r16Substitutions, selectedThirds, availableThirds, actuals)
    setR16Confirmed(true)
    setAsync('wc26_r16Confirmed', true)
  }

  // Función auxiliar para extraer info de grupo de una referencia
  const extractGroupInfoFromRef = (ref, matchId) => {
    if (ref.includes('3.º') && ref.includes('/')) {
      const selectedGroup = selectedThirds[matchId]
      if (selectedGroup) {
        return { position: '3', group: selectedGroup }
      }
    }
    const match = ref.match(/^(\d+)\.º\s*([A-Z])$/i)
    if (match) {
      return { position: match[1], group: match[2] }
    }
    return null
  }

  // Generar cuartos desde octavos
  const generateCuartosMatches = (octavosSubs, actualResults, octavosGroupInfoVal) => {
    const octMatches = MATCHES.filter(m => m.ph === 'OCT')
    const octCompleted = octMatches.every(m => actualResults[m.id]?.h !== undefined && actualResults[m.id]?.a !== undefined && actualResults[m.id]?.h !== '' && actualResults[m.id]?.a !== '')

    if (!octCompleted) return
    if (Object.keys(octavosSubs).length === 0) return

    const subs = {}
    const groupInfo = {}

    const getWinnerAndGroupInfo = (matchId) => {
      const match = MATCHES.find(m => m.id === matchId)
      const actual = actualResults[matchId]
      if (!match || !actual) return { winner: null, groupInfo: null }

      const h = octavosSubs[match.h] || match.h
      const a = octavosSubs[match.a] || match.a

      let winner, winningRef
      if (actual.winner) {
        winner = actual.winner === 'h' ? h : a
        winningRef = actual.winner === 'h' ? match.h : match.a
      } else {
        const hScore = Number(actual.h)
        const aScore = Number(actual.a)
        if (hScore > aScore) {
          winner = h
          winningRef = match.h
        } else if (aScore > hScore) {
          winner = a
          winningRef = match.a
        }
      }

      // Extraer info de grupo del reference del ganador (e.g., "Gan. P73")
      let gInfo = null
      if (winningRef && octavosGroupInfoVal && octavosGroupInfoVal[winningRef]) {
        gInfo = octavosGroupInfoVal[winningRef]
      }

      return { winner, groupInfo: gInfo }
    }

    // Mapeo: P89-P96 a P97-P100
    const octToCto = {
      89: [97, 90],
      91: [99, 92],
      93: [98, 94],
      95: [100, 96],
    }

    Object.entries(octToCto).forEach(([octId, [ctoId, octIdPair]]) => {
      const octIdNum = Number(octId)
      const octIdPairNum = Number(octIdPair)

      const { winner: winner1, groupInfo: gInfo1 } = getWinnerAndGroupInfo(octIdNum)
      const { winner: winner2, groupInfo: gInfo2 } = getWinnerAndGroupInfo(octIdPairNum)

      if (winner1) {
        subs[`Gan. P${octId}`] = winner1
        if (gInfo1) {
          groupInfo[`Gan. P${octId}`] = gInfo1
        }
      }

      if (winner2) {
        subs[`Gan. P${octIdPair}`] = winner2
        if (gInfo2) {
          groupInfo[`Gan. P${octIdPair}`] = gInfo2
        }
      }
    })

    setCuartosSubstitutions(subs)
    setCuartosGroupInfo(groupInfo)
    setAsync('wc26_cuartosSubstitutions', subs)
    setAsync('wc26_cuartosGroupInfo', groupInfo)
  }

  // Generar semifinales desde cuartos
  const generateSemifinalMatches = (cuartosSubs, actualResults, cuartosGroupInfoVal) => {
    const ctoMatches = MATCHES.filter(m => m.ph === 'CTO')
    const ctoCompleted = ctoMatches.every(m => actualResults[m.id]?.h !== undefined && actualResults[m.id]?.a !== undefined && actualResults[m.id]?.h !== '' && actualResults[m.id]?.a !== '')

    if (!ctoCompleted) return

    const subs = {}
    const groupInfo = {}

    const getWinnerAndGroupInfo = (matchId) => {
      const match = MATCHES.find(m => m.id === matchId)
      const actual = actualResults[matchId]
      if (!match || !actual) return { winner: null, groupInfo: null }

      const h = cuartosSubs[match.h] || match.h
      const a = cuartosSubs[match.a] || match.a

      let winner, winningRef
      if (actual.winner) {
        winner = actual.winner === 'h' ? h : a
        winningRef = actual.winner === 'h' ? match.h : match.a
      } else {
        const hScore = Number(actual.h)
        const aScore = Number(actual.a)
        if (hScore > aScore) {
          winner = h
          winningRef = match.h
        } else if (aScore > hScore) {
          winner = a
          winningRef = match.a
        }
      }

      // Extraer info de grupo del reference del ganador (e.g., "Gan. P97")
      let gInfo = null
      if (winningRef && cuartosGroupInfoVal && cuartosGroupInfoVal[winningRef]) {
        gInfo = cuartosGroupInfoVal[winningRef]
      }

      return { winner, groupInfo: gInfo }
    }

    // Mapeo: P97-P100 a P101-P102
    const ctoToSemi = {
      97: [101, 98],
      99: [102, 100],
    }

    Object.entries(ctoToSemi).forEach(([ctoId, [semiId, ctoIdPair]]) => {
      const ctoIdNum = Number(ctoId)
      const ctoIdPairNum = Number(ctoIdPair)

      const { winner: winner1, groupInfo: gInfo1 } = getWinnerAndGroupInfo(ctoIdNum)
      const { winner: winner2, groupInfo: gInfo2 } = getWinnerAndGroupInfo(ctoIdPairNum)

      if (winner1) {
        subs[`Gan. P${ctoId}`] = winner1
        if (gInfo1) {
          groupInfo[`Gan. P${ctoId}`] = gInfo1
        }
      }

      if (winner2) {
        subs[`Gan. P${ctoIdPair}`] = winner2
        if (gInfo2) {
          groupInfo[`Gan. P${ctoIdPair}`] = gInfo2
        }
      }
    })

    setSemifinalSubstitutions(subs)
    setSemifinalGroupInfo(groupInfo)
    setAsync('wc26_semifinalSubstitutions', subs)
    setAsync('wc26_semifinalGroupInfo', groupInfo)
  }

  // Generar tercer puesto y final desde semifinales
  const generateFinalMatches = (semifinalSubs, actualResults, semifinalGroupInfoVal) => {
    const semiMatches = MATCHES.filter(m => m.ph === 'SEMI')
    const semiCompleted = semiMatches.every(m => actualResults[m.id]?.h !== undefined && actualResults[m.id]?.a !== undefined && actualResults[m.id]?.h !== '' && actualResults[m.id]?.a !== '')

    if (!semiCompleted) return

    const tercerSubs = {}
    const tercerGroupInfo = {}
    const finalSubs = {}
    const finalGroupInfo = {}

    const getWinnerAndLoserWithGroupInfo = (matchId) => {
      const match = MATCHES.find(m => m.id === matchId)
      const actual = actualResults[matchId]
      if (!match || !actual) return { winner: null, winnerGroupInfo: null, loser: null, loserGroupInfo: null, winningRef: null, losingRef: null }

      const h = semifinalSubs[match.h] || match.h
      const a = semifinalSubs[match.a] || match.a

      let winner, winningRef, loser, losingRef
      if (actual.winner) {
        winner = actual.winner === 'h' ? h : a
        winningRef = actual.winner === 'h' ? match.h : match.a
        loser = actual.winner === 'h' ? a : h
        losingRef = actual.winner === 'h' ? match.a : match.h
      } else {
        const hScore = Number(actual.h)
        const aScore = Number(actual.a)
        if (hScore > aScore) {
          winner = h
          winningRef = match.h
          loser = a
          losingRef = match.a
        } else if (aScore > hScore) {
          winner = a
          winningRef = match.a
          loser = h
          losingRef = match.h
        }
      }

      // Extraer info de grupo de los references
      let winnerGroupInfo = null
      let loserGroupInfo = null
      if (winningRef && semifinalGroupInfoVal && semifinalGroupInfoVal[winningRef]) {
        winnerGroupInfo = semifinalGroupInfoVal[winningRef]
      }
      if (losingRef && semifinalGroupInfoVal && semifinalGroupInfoVal[losingRef]) {
        loserGroupInfo = semifinalGroupInfoVal[losingRef]
      }

      return { winner, winnerGroupInfo, loser, loserGroupInfo, winningRef, losingRef }
    }

    // P101 y P102 son semifinales
    const semi101 = getWinnerAndLoserWithGroupInfo(101)
    const semi102 = getWinnerAndLoserWithGroupInfo(102)

    // P103 es tercer puesto (perdedores de semis)
    if (semi101.loser && semi102.loser) {
      tercerSubs['Per. P101'] = semi101.loser
      tercerSubs['Per. P102'] = semi102.loser
      if (semi101.loserGroupInfo) {
        tercerGroupInfo['Per. P101'] = semi101.loserGroupInfo
      }
      if (semi102.loserGroupInfo) {
        tercerGroupInfo['Per. P102'] = semi102.loserGroupInfo
      }
    }

    // P104 es final (ganadores de semis)
    if (semi101.winner && semi102.winner) {
      finalSubs['Gan. P101'] = semi101.winner
      finalSubs['Gan. P102'] = semi102.winner
      if (semi101.winnerGroupInfo) {
        finalGroupInfo['Gan. P101'] = semi101.winnerGroupInfo
      }
      if (semi102.winnerGroupInfo) {
        finalGroupInfo['Gan. P102'] = semi102.winnerGroupInfo
      }
    }

    setTercerPuestoSubstitutions(tercerSubs)
    setTercerPuestoGroupInfo(tercerGroupInfo)
    setFinalSubstitutions(finalSubs)
    setFinalGroupInfo(finalGroupInfo)
    setAsync('wc26_tercerPuestoSubstitutions', tercerSubs)
    setAsync('wc26_tercerPuestoGroupInfo', tercerGroupInfo)
    setAsync('wc26_finalSubstitutions', finalSubs)
    setAsync('wc26_finalGroupInfo', finalGroupInfo)
  }

  const generateOctavosMatches = (r16Subs, selectedThirds, availThirds, actualResults) => {
    // Verificar que todos los R16 estén completos
    const r16Matches = MATCHES.filter(m => m.ph === 'R16')
    const r16Completed = r16Matches.every(m => actualResults[m.id]?.h !== undefined && actualResults[m.id]?.a !== undefined && actualResults[m.id]?.h !== '' && actualResults[m.id]?.a !== '')

    if (!r16Completed) return

    // Si r16Subs está vacío, generar primero (incluyendo terceros)
    let currentR16Subs = { ...r16Subs }
    if (Object.keys(currentR16Subs).length === 0) {
      const groupWinners = getAllGroupWinners(actualResults)
      Object.entries(groupWinners).forEach(([group, winners]) => {
        if (winners.first) currentR16Subs[`1.º ${group}`] = winners.first
        if (winners.second) currentR16Subs[`2.º ${group}`] = winners.second
        if (winners.third) currentR16Subs[`3.º ${group}`] = winners.third
      })
    }

    // Agregar substituciones de terceros seleccionados si existen
    // selectedThirds es { matchId: group, ... } entonces lo convertimos a { group: teamCode, ... }
    if (selectedThirds && availThirds) {
      Object.entries(selectedThirds).forEach(([matchId, selectedGroup]) => {
        if (selectedGroup && selectedGroup !== 'completed' && availThirds[selectedGroup]) {
          currentR16Subs[`3.º ${selectedGroup}`] = availThirds[selectedGroup]
        }
      })
    }

    // Mapeo de ganadores R16 → Octavos
    const octavosSubs = {}
    const octavosGroupInfoMap = {}

// Función para obtener el ganador de un partido
    const getWinner = (matchId) => {
      const match = MATCHES.find(m => m.id === matchId)
      const actual = actualResults[matchId]
      if (!match || !actual) return null

      // Función auxiliar para resolver referencias a terceros
      const resolveTeamRef = (ref) => {
        // Si es una referencia directa (1.º A, 2.º B), buscar en substituciones
        if (currentR16Subs[ref]) return currentR16Subs[ref]

        // Si es una referencia con múltiples opciones (3.º A/B/C), buscar cuál fue seleccionada
        if (ref.includes('3.º') && ref.includes('/')) {
          // Extraer los grupos posibles
          const match_ref = ref.match(/3\.º\s*(.+)/i)
          if (match_ref) {
            const possibleGroups = match_ref[1].split('/').map(g => g.trim())
            // Buscar cuál grupo fue seleccionado para este matchId
            const selectedGroup = selectedThirds[matchId]
            if (selectedGroup && possibleGroups.includes(selectedGroup)) {
              const teamCode = currentR16Subs[`3.º ${selectedGroup}`]
              if (teamCode) return teamCode
            }
          }
        }

        // Si es una referencia simple de tercero (3.º A)
        if (currentR16Subs[ref]) return currentR16Subs[ref]

        // Si no se puede resolver, devolver la referencia tal cual
        return ref
      }

      // Resolver códigos de equipo
      const h = resolveTeamRef(match.h)
      const a = resolveTeamRef(match.a)

      // Determinar ganador
      if (actual.winner) return actual.winner === 'h' ? h : a
      const hScore = Number(actual.h)
      const aScore = Number(actual.a)
      return hScore > aScore ? h : aScore > hScore ? a : null
    }

    // Mapeo: P73-P88 a P89-P96
    const r16ToOctavos = {
      73: [89, 75],
      74: [90, 77],
      76: [91, 78],
      79: [92, 80],
      83: [93, 84],
      81: [94, 82],
      86: [95, 88],
      85: [96, 87],
    }

    // Generar substituciones y extraer info de grupo
    Object.entries(r16ToOctavos).forEach(([r16Id, [octId, r16IdPair]]) => {
      const r16IdNum = Number(r16Id)
      const r16IdPairNum = Number(r16IdPair)
      const match1 = MATCHES.find(m => m.id === r16IdNum)
      const match2 = MATCHES.find(m => m.id === r16IdPairNum)

      if (match1) {
        const actual1 = actualResults[r16IdNum]
        const winner1 = getWinner(r16IdNum)

        if (winner1) {
          octavosSubs[`Gan. P${r16Id}`] = winner1

          // Determinar cuál equipo ganó (home o away) para extraer su grupo
          let winningRef = null
          if (actual1.winner) {
            winningRef = actual1.winner === 'h' ? match1.h : match1.a
          } else {
            const hScore = Number(actual1.h)
            const aScore = Number(actual1.a)
            winningRef = hScore > aScore ? match1.h : aScore > hScore ? match1.a : null
          }

          // Extraer info de grupo del equipo ganador
          if (winningRef) {
            const groupInfo = extractGroupInfoFromRef(winningRef, r16IdNum)
            if (groupInfo) {
              octavosGroupInfoMap[`Gan. P${r16Id}`] = groupInfo
            }
          }
        }
      }

      if (match2) {
        const actual2 = actualResults[r16IdPairNum]
        const winner2 = getWinner(r16IdPairNum)

        if (winner2) {
          octavosSubs[`Gan. P${r16IdPair}`] = winner2

          // Determinar cuál equipo ganó (home o away) para extraer su grupo
          let winningRef = null
          if (actual2.winner) {
            winningRef = actual2.winner === 'h' ? match2.h : match2.a
          } else {
            const hScore = Number(actual2.h)
            const aScore = Number(actual2.a)
            winningRef = hScore > aScore ? match2.h : aScore > hScore ? match2.a : null
          }

          // Extraer info de grupo del equipo ganador
          if (winningRef) {
            const groupInfo = extractGroupInfoFromRef(winningRef, r16IdPairNum)
            if (groupInfo) {
              octavosGroupInfoMap[`Gan. P${r16IdPair}`] = groupInfo
            }
          }
        }
      }
    })

    setOctavosSubstitutions(octavosSubs)
    setOctavosGroupInfo(octavosGroupInfoMap)
    setAsync('wc26_octavosSubstitutions', octavosSubs)
    setAsync('wc26_octavosGroupInfo', octavosGroupInfoMap)
  }

  // Obtener predicciones en formato compatible con calcTotalPts (estructura antigua)
  const getPredictionsForScoring = () => {
    const result = {}
    for (const [participantName, data] of Object.entries(predictions)) {
      result[participantName] = data.predictions || {}
    }
    return result
  }

  const totalPts = calcTotalPts(participant, getPredictionsForScoring(), actuals, MATCHES)

  // Calcular terceros disponibles para R16
  const getAvailableThirds = () => {
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
    const thirds = {}
    groups.forEach(g => {
      const groupMatches = MATCHES.filter(m => m.ph === 'G' && m.gr === g)
      const teams = new Set()
      groupMatches.forEach(m => {
        teams.add(m.h)
        teams.add(m.a)
      })

      const standings = Array.from(teams)
        .map(t => {
          let points = 0, goalsFor = 0, goalsAgainst = 0
          groupMatches.forEach(match => {
            if (!actuals[match.id]) return
            const { h, a } = actuals[match.id]
            if (match.h === t) {
              goalsFor += h
              goalsAgainst += a
              if (h > a) points += 3
              else if (h === a) points += 1
            } else if (match.a === t) {
              goalsFor += a
              goalsAgainst += h
              if (a > h) points += 3
              else if (a === h) points += 1
            }
          })
          return { team: t, points, goalsFor, goalsAgainst, diff: goalsFor - goalsAgainst }
        })
        .sort((a, b) => b.points - a.points || b.diff - a.diff || b.goalsFor - a.goalsFor)

      if (standings[2]) {
        thirds[g] = standings[2].team
      }
    })
    return thirds
  }

  const availableThirds = getAvailableThirds()

  if (loading) return (
    <div className={styles.loading}>Cargando...</div>
  )

  return (
    <div className={styles.app}>
      <Header
        participants={participants}
        participant={participant}
        setParticipant={setParticipant}
        addParticipant={addParticipant}
        totalPts={totalPts}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        tab={tab}
        setTab={setTab}
        simulate={simulate}
        simulate16={simulate16}
        simulateOctavos={simulateOctavos}
        simulateCuartos={simulateCuartos}
        simulateSemis={simulateSemis}
        simulateThirdPlace={simulateThirdPlace}
        simulateFinal={simulateFinal}
        simulatedJornadas={simulatedJornadas}
        simulatedPhases={simulatedPhases}
        selectedThirds={selectedThirds}
        clearAllData={clearAllData}
      />

      <div className={styles.content}>
        {tab === 'resultados' && (
          <Resultados
            phase={phase}
            setPhase={setPhase}
            group={group}
            setGroup={setGroup}
            actuals={actuals}
            saveActual={saveActual}
            setWinner={setWinner}
            isAdmin={isAdmin}
            r16Substitutions={r16Substitutions}
            octavosSubstitutions={octavosSubstitutions}
            octavosGroupInfo={octavosGroupInfo}
            cuartosSubstitutions={cuartosSubstitutions}
            cuartosGroupInfo={cuartosGroupInfo}
            semifinalSubstitutions={semifinalSubstitutions}
            semifinalGroupInfo={semifinalGroupInfo}
            tercerPuestoSubstitutions={tercerPuestoSubstitutions}
            tercerPuestoGroupInfo={tercerPuestoGroupInfo}
            finalSubstitutions={finalSubstitutions}
            finalGroupInfo={finalGroupInfo}
            r16Confirmed={r16Confirmed}
            confirmR16={confirmR16}
            selectedThirds={selectedThirds}
            availableThirds={availableThirds}
            onSelectThird={(matchId, group) => {
              const newSelected = { ...selectedThirds, [matchId]: group }
              setSelectedThirds(newSelected)
              console.log(`[onSelectThird] Match ${matchId}: saving third=${group}`)
              setAsync('wc26_selectedThirds', newSelected).catch(err => {
                console.error(`[onSelectThird] Failed to save thirds:`, err)
              })

              // Actualizar r16Substitutions cuando se selecciona un tercero
              const teamCode = availableThirds[group]
              if (teamCode) {
                const newSubs = { ...r16Substitutions, [`3.º ${group}`]: teamCode }
                setR16Substitutions(newSubs)
                setAsync('wc26_r16Substitutions', newSubs).catch(err => {
                  console.error(`[onSelectThird] Failed to save r16Substitutions:`, err)
                })
              }
            }}
            simulatedJornadas={simulatedJornadas}
            resultsConfirmed={resultsConfirmed}
            confirmResults={confirmResults}
            r16MatchupsConfirmed={r16MatchupsConfirmed}
            confirmR16Matchups={confirmR16Matchups}
          />
        )}
        {tab === 'grupos' && <Grupos actuals={actuals} selectedThirds={selectedThirds} />}
        {tab === 'apuestas' && (
          <Apuestas
            participants={participants}
            participant={participant}
            phase={phase}
            setPhase={setPhase}
            group={group}
            setGroup={setGroup}
            predictions={predictions}
            savePred={savePred}
            setPredictedWinner={setPredictedWinner}
            actuals={actuals}
            getCurrentJornada={getCurrentJornada}
            confirmJornada={confirmJornada}
            confirmR16Prediction={confirmR16Prediction}
            confirmEliminationPhase={confirmEliminationPhase}
            r16Substitutions={r16Substitutions}
            octavosSubstitutions={octavosSubstitutions}
            octavosGroupInfo={octavosGroupInfo}
            cuartosSubstitutions={cuartosSubstitutions}
            cuartosGroupInfo={cuartosGroupInfo}
            semifinalSubstitutions={semifinalSubstitutions}
            semifinalGroupInfo={semifinalGroupInfo}
            tercerPuestoSubstitutions={tercerPuestoSubstitutions}
            tercerPuestoGroupInfo={tercerPuestoGroupInfo}
            finalSubstitutions={finalSubstitutions}
            finalGroupInfo={finalGroupInfo}
            availableThirds={availableThirds}
            selectedThirds={selectedThirds}
            resultsConfirmed={resultsConfirmed}
            r16MatchupsConfirmed={r16MatchupsConfirmed}
            isAdmin={isAdmin}
          />
        )}
        {tab === 'editar-apuestas' && (
          <EditarApuestas
            participants={participants}
            selectedParticipant={selectedParticipantForEditing}
            setSelectedParticipant={setSelectedParticipantForEditing}
            phase={phase}
            setPhase={setPhase}
            predictions={predictions}
            savePred={savePred}
            setPredictedWinner={setPredictedWinner}
            actuals={actuals}
            r16Substitutions={r16Substitutions}
            octavosSubstitutions={octavosSubstitutions}
            octavosGroupInfo={octavosGroupInfo}
            cuartosSubstitutions={cuartosSubstitutions}
            cuartosGroupInfo={cuartosGroupInfo}
            semifinalSubstitutions={semifinalSubstitutions}
            semifinalGroupInfo={semifinalGroupInfo}
            tercerPuestoSubstitutions={tercerPuestoSubstitutions}
            tercerPuestoGroupInfo={tercerPuestoGroupInfo}
            finalSubstitutions={finalSubstitutions}
            finalGroupInfo={finalGroupInfo}
            availableThirds={availableThirds}
            selectedThirds={selectedThirds}
          />
        )}
        {tab === 'todas' && (
          <Todas
            participants={participants}
            phase={phase}
            setPhase={setPhase}
            group={group}
            setGroup={setGroup}
            predictions={getPredictionsForScoring()}
            actuals={actuals}
            r16Substitutions={r16Substitutions}
            octavosSubstitutions={octavosSubstitutions}
            cuartosSubstitutions={cuartosSubstitutions}
            semifinalSubstitutions={semifinalSubstitutions}
            tercerPuestoSubstitutions={tercerPuestoSubstitutions}
            finalSubstitutions={finalSubstitutions}
            selectedThirds={selectedThirds}
            availableThirds={availableThirds}
          />
        )}
        {tab === 'clasificacion' && (
          <Clasificacion
            participants={participants}
            predictions={getPredictionsForScoring()}
            actuals={actuals}
          />
        )}
        {tab === 'evolucion' && (
          <Evolucion
            participants={participants}
            predictions={getPredictionsForScoring()}
            actuals={actuals}
            resultsConfirmed={resultsConfirmed}
          />
        )}
      </div>
    </div>
  )
}
// Force rebuild
// Force rebuild
// Force rebuild
