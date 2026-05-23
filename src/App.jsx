import { useState, useEffect } from 'react'
import { DEFAULT_PARTICIPANTS } from './data/teams'
import { MATCHES } from './data/matches'
import { calcTotalPts } from './utils/scoring'
import { storage } from './utils/storage'
import { getAllGroupWinners } from './utils/groupStandings'
import Header from './components/Header'
import Resultados from './components/Resultados'
import Apuestas from './components/Apuestas'
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
  const [loading, setLoading] = useState(true)
  const [simulatedJornadas, setSimulatedJornadas] = useState({ 1: false, 2: false, 3: false })
  const [r16Substitutions, setR16Substitutions] = useState({})
  const [selectedThirds, setSelectedThirds] = useState({})

  useEffect(() => {
    const parts = DEFAULT_PARTICIPANTS
    setParticipants(parts)
    storage.set('wc26_participants', parts)

    let preds = storage.get('wc26_predictions', {})
    // Migrar a formato nuevo si es necesario
    preds = storage.ensureNewFormat(preds)
    const acts = storage.get('wc26_actuals', {})
    const simJornadas = storage.get('wc26_simulatedJornadas', { 1: false, 2: false, 3: false })
    const subs = storage.get('wc26_r16Substitutions', {})
    const selThirds = storage.get('wc26_selectedThirds', {})

    setPredictions(preds)
    setActuals(acts)
    setSimulatedJornadas(simJornadas)
    setR16Substitutions(subs)
    setSelectedThirds(selThirds)
    setLoading(false)
  }, [])

  const savePred = (matchId, h, a) => {
    if (!participant) return
    const next = {
      ...predictions,
      [participant]: {
        predictions: {
          ...(predictions[participant]?.predictions || {}),
          [matchId]: { h, a },
        },
        confirmed: predictions[participant]?.confirmed || { 1: false, 2: false, 3: false },
      },
    }
    setPredictions(next)
    storage.set('wc26_predictions', next)
  }

  const saveActual = (matchId, h, a) => {
    const next = { ...actuals }
    if (h === undefined || a === undefined) {
      delete next[matchId]
    } else {
      next[matchId] = { h, a }
    }
    setActuals(next)
    storage.set('wc26_actuals', next)
  }

  const addParticipant = (name) => {
    if (!name || participants.includes(name)) return
    const next = [...participants, name]
    setParticipants(next)
    setParticipant(name)
    storage.set('wc26_participants', next)
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
    storage.set('wc26_predictions', next)
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
      newPreds[p] = pData
    })

    // Marcar jornada como simulada
    const newSimJornadas = { ...simulatedJornadas, [jornada]: true }

    setActuals(newActuals)
    setPredictions(newPreds)
    setSimulatedJornadas(newSimJornadas)

    storage.set('wc26_actuals', newActuals)
    storage.set('wc26_predictions', newPreds)
    storage.set('wc26_simulatedJornadas', newSimJornadas)
  }

  // Validar automáticamente ganadores cuando todas las jornadas estén simuladas
  useEffect(() => {
    if (simulatedJornadas[1] && simulatedJornadas[2] && simulatedJornadas[3]) {
      generateR16Matches()
    }
  }, [simulatedJornadas])

  // Confirmar terceros lugares seleccionados y generar dieciseisavos
  const confirmThirdPlaces = (selectedMap) => {
    if (Object.keys(selectedMap).length !== 8) return

    const groupWinners = getAllGroupWinners(actuals)

    // Crear mapeo de substituciones incluyendo terceros
    const subs = {}
    Object.entries(groupWinners).forEach(([group, winners]) => {
      if (winners.first) subs[`1.º ${group}`] = winners.first
      if (winners.second) subs[`2.º ${group}`] = winners.second
      if (winners.third) subs[`3.º ${group}`] = winners.third
    })

    // Reemplazar referencias de terceros con los seleccionados
    Object.entries(selectedMap).forEach(([group, team]) => {
      subs[`3.º ${group}`] = team
    })

    setR16Substitutions(subs)
    setSelectedThirds({ ...selectedMap, completed: true })
    storage.set('wc26_r16Substitutions', subs)
    storage.set('wc26_selectedThirds', { ...selectedMap, completed: true })
  }

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
    storage.set('wc26_r16Substitutions', subs)
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
        simulatedJornadas={simulatedJornadas}
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
            isAdmin={isAdmin}
            r16Substitutions={r16Substitutions}
            selectedThirds={selectedThirds}
            onConfirmThirds={confirmThirdPlaces}
            simulatedJornadas={simulatedJornadas}
          />
        )}
        {tab === 'grupos' && <Grupos actuals={actuals} />}
        {tab === 'apuestas' && (
          <Apuestas
            participant={participant}
            phase={phase}
            setPhase={setPhase}
            group={group}
            setGroup={setGroup}
            predictions={predictions}
            savePred={savePred}
            actuals={actuals}
            getCurrentJornada={getCurrentJornada}
            confirmJornada={confirmJornada}
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
          />
        )}
      </div>
    </div>
  )
}
