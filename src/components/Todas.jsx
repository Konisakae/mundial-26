import { MATCHES } from '../data/matches'
import { TEAMS } from '../data/teams'
import { AVATAR_COLORS } from '../data/colors'
import CustomSelect from './CustomSelect'
import styles from '../styles/Todas.module.css'

export default function Todas({ participants, phase, setPhase, group, setGroup, predictions, actuals }) {
  const matches = MATCHES.filter(m => m.ph === phase && (phase === 'G' ? m.gr === group : true))
  const groups = phase === 'G' ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] : []

  return (
    <div className={styles.todas}>
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
        <CustomSelect
          value={phase}
          onChange={setPhase}
          label="Fase:"
          options={[
            { value: 'G', label: 'Grupos' },
            { value: 'R16', label: 'Dieciseisavos' },
            { value: 'OCT', label: 'Octavos' },
            { value: 'CTO', label: 'Cuartos' },
            { value: 'SEMI', label: 'Semifinales' },
            { value: 'FIN', label: 'Final' },
          ]}
        />
      </div>

      <div className={styles.matches}>
        {matches.map(match => {
          const h = TEAMS[match.h]
          const a = TEAMS[match.a]
          const actual = actuals[match.id]

          return (
            <div key={match.id} className={styles.matchCard}>
              <div className={styles.matchInfo}>
                <div className={styles.matchHeader}>
                  <span className={styles.date}>{match.dt}</span>
                  <span className={styles.time}>{match.tm}</span>
                </div>

                <div className={styles.matchResult}>
                  <div className={styles.team}>
                    <span className={styles.flag}>{h?.f}</span>
                    <span className={styles.name}>{h?.n}</span>
                  </div>
                  <div className={styles.score}>
                    {actual ? (
                      <>
                        <span>{actual.h}</span>
                        <span>-</span>
                        <span>{actual.a}</span>
                      </>
                    ) : (
                      <span className={styles.pending}>pendiente</span>
                    )}
                  </div>
                  <div className={styles.team}>
                    <span className={styles.name}>{a?.n}</span>
                    <span className={styles.flag}>{a?.f}</span>
                  </div>
                </div>
              </div>

              <div className={styles.predictions}>
                <div className={styles.predictionsHeader}>Apuestas</div>
                <div className={styles.predictionsList}>
                  {participants.map((p, i) => {
                    const pred = predictions[p]?.[match.id] || { h: '', a: '' }
                    const av = AVATAR_COLORS[i % AVATAR_COLORS.length]

                    return (
                      <div key={p} className={styles.prediction}>
                        <div className={styles.participantName}>
                          <div className={styles.avatar} style={{ background: av.b, color: av.t }}>
                            {p[0]}
                          </div>
                          <span>{p}</span>
                        </div>
                        <div className={styles.predScore}>
                          {pred.h !== '' ? (
                            <>
                              <span>{pred.h}</span>
                              <span>-</span>
                              <span>{pred.a}</span>
                            </>
                          ) : (
                            <span className={styles.noPred}>-</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
