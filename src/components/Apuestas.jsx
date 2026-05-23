import { MATCHES } from '../data/matches'
import { initials } from '../utils/scoring'
import { AVATAR_COLORS } from '../data/colors'
import MatchCard from './MatchCard'
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
          const pred = userPreds[match.id] || { h: '', a: '' }
          const actual = actuals[match.id]

          return (
            <MatchCard
              key={match.id}
              match={match}
              value={pred}
              onChange={(field, val) => savePred(match.id, field === 'h' ? parseInt(val) || 0 : pred.h, field === 'a' ? parseInt(val) || 0 : pred.a)}
              actual={actual}
              showActual={true}
              editable={true}
            />
          )
        })}
      </div>
    </div>
  )
}
