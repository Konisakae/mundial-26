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

  useEffect(() => {
    const parts = DEFAULT_PARTICIPANTS
    setParticipants(parts)
    storage.set('wc26_participants', parts)

    let preds = storage.get('wc26_predictions', {})
    // Migrar a formato nuevo si es necesario
    preds = storage.ensureNewFormat(preds)
    const acts = storage.get('wc26_actuals', {})
    const simJornadas = storage.get('wc26_simulatedJornadas', { 1: false, 2: false, 3: false })

    setPredictions(preds)
    setActuals(acts)
    setSimulatedJornadas(simJornadas)
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

  // Generar automáticamente partidos de dieciseisavos cuando grupos estén listos
  const generateR16Matches = () => {
    if (Object.values(actuals).filter(a => a?.h !== undefined).length < 72) return

    const groupWinners = getAllGroupWinners(actuals)

    // Estructura de dieciseisavos: 1º grupos enfrentan 2º grupos
    // P73: 1º A vs 2º B
    // P74: 1º C vs 2º D
    // P75: 1º E vs 2º F
    // P76: 1º G vs 2º H
    // P77: 1º I vs 2º J
    // P78: 1º K vs 2º L
    // P79: 1º B vs 2º A
    // P80: 1º D vs 2º C
    // P81: 1º F vs 2º E
    // P82: 1º H vs 2º G
    // P83: 1º J vs 2º I
    // P84: 1º L vs 2º K
    // ... (resto de combinaciones)

    const pairings = [
      { match: 73, h: '1.º A', a: '2.º B' },
      { match: 74, h: '1.º C', a: '2.º D' },
      { match: 75, h: '1.º E', a: '2.º F' },
      { match: 76, h: '1.º G', a: '2.º H' },
      { match: 77, h: '1.º I', a: '2.º J' },
      { match: 78, h: '1.º K', a: '2.º L' },
      { match: 79, h: '1.º B', a: '2.º A' },
      { match: 80, h: '1.º D', a: '2.º C' },
      { match: 81, h: '1.º F', a: '2.º E' },
      { match: 82, h: '1.º H', a: '2.º G' },
      { match: 83, h: '1.º J', a: '2.º I' },
      { match: 84, h: '1.º L', a: '2.º K' },
      { match: 85, h: '3.º A/B/C/D/F', a: '1.º ....' },
      { match: 86, h: '3.º A/B/C/D/F', a: '1.º ....' },
      { match: 87, h: '3.º A/B/C/D/F', a: '1.º ....' },
      { match: 88, h: '3.º A/B/C/D/F', a: '1.º ....' }
    ]

    const newActuals = { ...actuals }

    // Llenar con equipos reales (simplificado por ahora)
    pairings.slice(0, 12).forEach(p => {
      const groupH = p.h.split('.º ')[1]
      const groupA = p.a.split('.º ')[1]
      const h = groupWinners[groupH]?.first || 'TBD'
      const a = groupWinners[groupA]?.second || 'TBD'

      if (h !== 'TBD' && a !== 'TBD') {
        newActuals[p.match] = { h: 0, a: 0 }
      }
    })

    setActuals(newActuals)
    storage.set('wc26_actuals', newActuals)
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
