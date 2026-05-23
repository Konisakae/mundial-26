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
  const [octavosSubstitutions, setOctavosSubstitutions] = useState({})
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
    const octSubs = storage.get('wc26_octavosSubstitutions', {})
    const selThirds = storage.get('wc26_selectedThirds', {})

    setPredictions(preds)
    setActuals(acts)
    setSimulatedJornadas(simJornadas)
    setR16Substitutions(subs)
    setOctavosSubstitutions(octSubs)
    setSelectedThirds(selThirds)
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
        storage.set('wc26_r16Substitutions', newSubs)
      }
    }
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
      next[matchId] = { ...next[matchId], h, a }
    }
    setActuals(next)
    storage.set('wc26_actuals', next)

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
      storage.set('wc26_r16Substitutions', newSubs)
    }
  }

  const setWinner = (matchId, winner) => {
    const next = { ...actuals }
    if (next[matchId]) {
      next[matchId] = { ...next[matchId], winner: winner || undefined }
      setActuals(next)
      storage.set('wc26_actuals', next)
    }
  }

  const setPredictedWinner = (matchId, winner) => {
    if (!participant) return
    const next = {
      ...predictions,
      [participant]: {
        predictions: {
          ...(predictions[participant]?.predictions || {}),
          [matchId]: {
            ...(predictions[participant]?.predictions[matchId] || {}),
            winner: winner || undefined
          }
        },
        confirmed: predictions[participant]?.confirmed || { 1: false, 2: false, 3: false },
      },
    }
    setPredictions(next)
    storage.set('wc26_predictions', next)
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

  // Simular dieciseisavos cuando todos los terceros estén seleccionados
  const simulate16 = () => {
    const selectedGroupCount = Object.keys(selectedThirds).length
    if (selectedGroupCount < 8) return

    // Obtener los 16 partidos de dieciseisavos
    const r16Matches = MATCHES.filter(m => m.ph === 'R16' && m.id >= 73 && m.id <= 88)

    // Generar resultados reales simulados
    const newActuals = { ...actuals }
    r16Matches.forEach(m => {
      newActuals[m.id] = {
        h: Math.floor(Math.random() * 4),
        a: Math.floor(Math.random() * 4)
      }
    })

    // Generar predicciones para todos los participantes
    const newPreds = { ...predictions }
    participants.forEach(p => {
      const pData = newPreds[p] || { predictions: {}, confirmed: { 1: false, 2: false, 3: false } }
      r16Matches.forEach(m => {
        pData.predictions[m.id] = {
          h: Math.floor(Math.random() * 4),
          a: Math.floor(Math.random() * 4)
        }
      })
      newPreds[p] = pData
    })

    setActuals(newActuals)
    setPredictions(newPreds)

    storage.set('wc26_actuals', newActuals)
    storage.set('wc26_predictions', newPreds)
  }

  // Validar automáticamente ganadores cuando todas las jornadas estén simuladas
  useEffect(() => {
    if (simulatedJornadas[1] && simulatedJornadas[2] && simulatedJornadas[3]) {
      generateR16Matches()
    }
  }, [simulatedJornadas])

  // Generar octavos cuando se completen todos los R16
  useEffect(() => {
    generateOctavosMatches()
  }, [actuals, r16Substitutions])

  // Regenerar R16 cuando se cambia a la fase R16 en Apuestas
  useEffect(() => {
    if (phase === 'R16') {
      const resultCount = Object.values(actuals).filter(a => a?.h !== undefined).length
      if (resultCount >= 72) {
        // Verificar si r16Substitutions tiene los primeros (debería tener al menos 12 entradas)
        if (Object.keys(r16Substitutions).length < 12) {
          const groupWinners = getAllGroupWinners(actuals)
          const newSubs = { ...r16Substitutions }
          Object.entries(groupWinners).forEach(([group, winners]) => {
            if (winners.first) newSubs[`1.º ${group}`] = winners.first
            if (winners.second) newSubs[`2.º ${group}`] = winners.second
          })
          setR16Substitutions(newSubs)
          storage.set('wc26_r16Substitutions', newSubs)
        }
      }
    }
  }, [phase, actuals])

  // Borrar todos los datos simulados
  const clearAllData = () => {
    if (!window.confirm('¿Borrar toda la simulación? No se puede deshacer.')) return

    setActuals({})
    setPredictions({})
    setSimulatedJornadas({ 1: false, 2: false, 3: false })
    setR16Substitutions({})
    setSelectedThirds({})

    storage.set('wc26_actuals', {})
    storage.set('wc26_predictions', {})
    storage.set('wc26_simulatedJornadas', { 1: false, 2: false, 3: false })
    storage.set('wc26_r16Substitutions', {})
    storage.set('wc26_selectedThirds', {})
  }

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

  const generateOctavosMatches = () => {
    // Verificar que todos los R16 estén completos
    const r16Matches = MATCHES.filter(m => m.ph === 'R16')
    const r16Completed = r16Matches.every(m => actuals[m.id]?.h !== undefined && actuals[m.id]?.a !== undefined && actuals[m.id]?.h !== '' && actuals[m.id]?.a !== '')

    if (!r16Completed) return

    // Si r16Substitutions está vacío, generar primero
    let currentR16Subs = r16Substitutions
    if (Object.keys(currentR16Subs).length === 0) {
      const groupWinners = getAllGroupWinners(actuals)
      const subs = {}
      Object.entries(groupWinners).forEach(([group, winners]) => {
        if (winners.first) subs[`1.º ${group}`] = winners.first
        if (winners.second) subs[`2.º ${group}`] = winners.second
      })
      currentR16Subs = subs
    }

    // Mapeo de ganadores R16 → Octavos
    const octavosSubs = {}

    // Función para obtener el ganador de un partido
    const getWinner = (matchId) => {
      const match = MATCHES.find(m => m.id === matchId)
      const actual = actuals[matchId]
      if (!match || !actual) return null

      // Resolver códigos de equipo
      const h = currentR16Subs[match.h] || match.h
      const a = currentR16Subs[match.a] || match.a

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

    // Generar substituciones
    Object.entries(r16ToOctavos).forEach(([r16Id, [octId, r16IdPair]]) => {
      const winner1 = getWinner(Number(r16Id))
      const winner2 = getWinner(Number(r16IdPair))

      if (winner1) octavosSubs[`Gan. P${r16Id}`] = winner1
      if (winner2) octavosSubs[`Gan. P${r16IdPair}`] = winner2
    })

    setOctavosSubstitutions(octavosSubs)
    storage.set('wc26_octavosSubstitutions', octavosSubs)
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
        simulatedJornadas={simulatedJornadas}
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
            selectedThirds={selectedThirds}
            availableThirds={availableThirds}
            onSelectThird={(matchId, group) => {
              const newSelected = { ...selectedThirds, [matchId]: group }
              setSelectedThirds(newSelected)
              storage.set('wc26_selectedThirds', newSelected)

              // Actualizar r16Substitutions cuando se selecciona un tercero
              const teamCode = availableThirds[group]
              if (teamCode) {
                const newSubs = { ...r16Substitutions, [`3.º ${group}`]: teamCode }
                setR16Substitutions(newSubs)
                storage.set('wc26_r16Substitutions', newSubs)
              }
            }}
            simulatedJornadas={simulatedJornadas}
          />
        )}
        {tab === 'grupos' && <Grupos actuals={actuals} selectedThirds={selectedThirds} />}
        {tab === 'apuestas' && (
          <Apuestas
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
            r16Substitutions={r16Substitutions}
            octavosSubstitutions={octavosSubstitutions}
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
