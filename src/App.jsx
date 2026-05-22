import { useState, useEffect } from 'react'
import { DEFAULT_PARTICIPANTS } from './data/teams'
import { MATCHES } from './data/matches'
import { calcTotalPts } from './utils/scoring'
import { storage } from './utils/storage'
import Header from './components/Header'
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
    const parts = storage.get('wc26_participants', DEFAULT_PARTICIPANTS)
    setParticipants(parts)
    storage.set('wc26_participants', parts)

    const preds = storage.get('wc26_predictions', {})
    const acts = storage.get('wc26_actuals', {})
    setPredictions(preds)
    setActuals(acts)
    setLoading(false)
  }, [])

  const savePred = (matchId, h, a) => {
    if (!participant) return
    const next = {
      ...predictions,
      [participant]: { ...(predictions[participant] || {}), [matchId]: { h, a } },
    }
    setPredictions(next)
    storage.set('wc26_predictions', next)
  }

  const saveActual = (matchId, h, a) => {
    const next = { ...actuals, [matchId]: { h, a } }
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

  const totalPts = calcTotalPts(participant, predictions, actuals, MATCHES)

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
      />

      <div className={styles.content}>
        {tab === 'resultados' && <div>Resultados</div>}
        {tab === 'grupos' && <div>Grupos</div>}
        {tab === 'apuestas' && <div>Apuestas</div>}
        {tab === 'todas' && <div>Todas las apuestas</div>}
        {tab === 'clasificacion' && <div>Clasificación</div>}
        {tab === 'evolucion' && <div>Evolución</div>}
      </div>
    </div>
  )
}
