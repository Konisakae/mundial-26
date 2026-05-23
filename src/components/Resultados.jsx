import { useState } from 'react'
import { MATCHES } from '../data/matches'
import MatchCard from './MatchCard'
import styles from '../styles/Resultados.module.css'

export default function Resultados({ phase, setPhase, group, setGroup, actuals, saveActual, isAdmin }) {
  const [editing, setEditing] = useState({})

  const matches = MATCHES.filter(m => m.ph === phase && (phase === 'G' ? m.gr === group : true))

  const groups = phase === 'G' ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] : []

  const handleInputChange = (matchId, field, value) => {
    const curr = editing[matchId] || actuals[matchId] || { h: '', a: '' }
    const updated = { ...curr, [field]: value }
    setEditing({ ...editing, [matchId]: updated })
  }

  const handleSave = (matchId) => {
    const data = editing[matchId]
    if (data) {
      saveActual(matchId, parseInt(data.h) || 0, parseInt(data.a) || 0)
      setEditing({ ...editing, [matchId]: undefined })
    }
  }

  const handleReset = (matchId) => {
    saveActual(matchId, undefined, undefined)
    setEditing({ ...editing, [matchId]: undefined })
  }

  return (
    <div className={styles.resultados}>
      <div className={styles.controls}>
        <div className={styles.phaseSelect}>
          <label>Fase:</label>
          <select value={phase} onChange={e => setPhase(e.target.value)} className={styles.select}>
            <option value="G">Grupos</option>
            <option value="R16">16avos</option>
            <option value="QF">Cuartos</option>
            <option value="SF">Semis</option>
            <option value="F">Final</option>
          </select>
        </div>
        {groups.length > 0 && (
          <div className={styles.groupSelect}>
            <label>Grupo:</label>
            <select value={group} onChange={e => setGroup(e.target.value)} className={styles.select}>
              {groups.map(g => (
                <option key={g} value={g}>Grupo {g}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={styles.matches}>
        {matches.map(match => {
          const actual = actuals[match.id]
          const editing_data = editing[match.id]

          return (
            <MatchCard
              key={match.id}
              match={match}
              value={isAdmin && !actual ? editing_data : null}
              onChange={isAdmin && !actual ? (field, val) => handleInputChange(match.id, field, val) : null}
              onReset={isAdmin && actual ? () => handleReset(match.id) : null}
              actual={actual}
              showActual={false}
              editable={isAdmin && !actual}
              saveBtn={isAdmin && !actual ? () => handleSave(match.id) : null}
              resetBtn={isAdmin && actual ? () => handleReset(match.id) : null}
            />
          )
        })}
      </div>
    </div>
  )
}
