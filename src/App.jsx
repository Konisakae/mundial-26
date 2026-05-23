import { useState, useEffect } from 'react'
import { DEFAULT_PARTICIPANTS } from './data/teams'
import { MATCHES } from './data/matches'
import { calcTotalPts } from './utils/scoring'
import { storage } from './utils/storage'
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

  useEffect(() => {
    const parts = DEFAULT_PARTICIPANTS
    setParticipants(parts)
    storage.set('wc26_participants', parts)

    let preds = storage.get('wc26_predictions', {})
    // Migrar a formato nuevo si es necesario
    preds = storage.ensureNewFormat(preds)
    const acts = storage.get('wc26_actuals', {})
    setPredictions(preds)
    setActuals(acts)
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

  // Simular jornada 1 con datos de prueba
  const simulateJornada1 = () => {
    // Partidos de jornada 1 (matchIds 1-8)
    const jornada1Matches = MATCHES.filter(m => m.ph === 'G' && m.id <= 8)

    // Generar resultados reales simulados
    const simActuals = {}
    jornada1Matches.forEach(m => {
      simActuals[m.id] = {
        h: Math.floor(Math.random() * 4),
        a: Math.floor(Math.random() * 4)
      }
    })

    // Generar predicciones para todos los participantes
    const simPreds = {}
    participants.forEach(p => {
      const pPreds = {}
      jornada1Matches.forEach(m => {
        pPreds[m.id] = {
          h: Math.floor(Math.random() * 4),
          a: Math.floor(Math.random() * 4)
        }
      })
      simPreds[p] = {
        predictions: pPreds,
        confirmed: { 1: true, 2: false, 3: false }
      }
    })

    setActuals(simActuals)
    setPredictions(simPreds)
    storage.set('wc26_actuals', simActuals)
    storage.set('wc26_predictions', simPreds)
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
        simulateJornada1={simulateJornada1}
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
