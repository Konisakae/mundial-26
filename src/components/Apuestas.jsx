import { MATCHES } from '../data/matches'
import { TEAMS } from '../data/teams'
import { initials } from '../utils/scoring'
import { AVATAR_COLORS } from '../data/colors'
import styles from '../styles/Apuestas.module.css'

export default function Apuestas({
  participant,
  phase,
  setPhase,
  group,
  setGroup,
  predictions,
  savePred,
  actuals,
}) {
  if (!participant) {
    return <div className={styles.noParticipant}>Selecciona un participante primero</div>
  }

  const matches = MATCHES.filter(m => m.ph === phase && (phase === 'G' ? m.gr === group : true))
  const pIdx = participant ? participant.charCodeAt(0) : 0
  const pAv = AVATAR_COLORS[pIdx % AVATAR_COLORS.length]
  const userPreds = predictions[participant] || {}
  const groups = phase === 'G' ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] : []

  return (
    <div className={styles.apuestas}>
      <div className={styles.header}>
        <div className={styles.userChip} style={{ background: pAv.b, color: pAv.t }}>
          {initials(participant)}
        </div>
        <span>{participant}</span>
      </div>

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
          const pred = userPreds[match.id] || { h: '', a: '' }
          const actual = actuals[match.id]

          return (
            <div key={match.id} className={styles.matchCard}>
              <div className={styles.matchMeta}>
                <span className={styles.date}>{match.dt}</span>
                <span className={styles.time}>{match.tm}</span>
              </div>

              <div className={styles.matchLayout}>
                <div className={styles.team}>
                  <span className={styles.flag}>{h?.f}</span>
                  <span className={styles.teamName}>{h?.n}</span>
                </div>

                <div className={styles.inputSection}>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    placeholder="0"
                    value={pred.h === '' ? '' : pred.h}
                    onChange={e => savePred(match.id, parseInt(e.target.value) || 0, pred.a)}
                    className={styles.input}
                  />
                  <span className={styles.dash}>-</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    placeholder="0"
                    value={pred.a === '' ? '' : pred.a}
                    onChange={e => savePred(match.id, pred.h, parseInt(e.target.value) || 0)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.team}>
                  <span className={styles.teamName}>{a?.n}</span>
                  <span className={styles.flag}>{a?.f}</span>
                </div>
              </div>

              {actual && (
                <div className={styles.actualResult}>
                  Resultado: {actual.h}-{actual.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
