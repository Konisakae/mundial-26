import { useState } from 'react'
import { MATCHES } from '../data/matches'
import { TEAMS } from '../data/teams'
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

  return (
    <div className={styles.resultados}>
      <div className={styles.controls}>
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
      </div>

      <div className={styles.matches}>
        {matches.map(match => {
          const h = TEAMS[match.h]
          const a = TEAMS[match.a]
          const actual = actuals[match.id]

          return (
            <div key={match.id} className={styles.match}>
              <div className={styles.matchHeader}>
                <span className={styles.date}>{match.dt}</span>
                <span className={styles.time}>{match.tm}</span>
              </div>

              <div className={styles.matchBody}>
                <div className={styles.team}>
                  <span className={styles.flag}>{h?.f}</span>
                  <span className={styles.name}>{h?.n}</span>
                </div>

                <div className={styles.score}>
                  {isAdmin && !actual ? (
                    <>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        placeholder="0"
                        value={editing[match.id]?.h ?? ''}
                        onChange={e => handleInputChange(match.id, 'h', e.target.value)}
                        className={styles.input}
                      />
                      <span>-</span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        placeholder="0"
                        value={editing[match.id]?.a ?? ''}
                        onChange={e => handleInputChange(match.id, 'a', e.target.value)}
                        className={styles.input}
                      />
                      <button
                        onClick={() => handleSave(match.id)}
                        className={styles.saveBtn}
                      >
                        ✓
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={styles.gol}>{actual?.h ?? '-'}</span>
                      <span>-</span>
                      <span className={styles.gol}>{actual?.a ?? '-'}</span>
                    </>
                  )}
                </div>

                <div className={styles.team}>
                  <span className={styles.name}>{a?.n}</span>
                  <span className={styles.flag}>{a?.f}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
