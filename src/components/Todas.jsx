import { useState } from 'react'
import { MATCHES } from '../data/matches'
import { TEAMS } from '../data/teams'
import { AVATAR_COLORS } from '../data/colors'
import { getMatchesForJornada } from '../utils/jornadas'
import CustomSelect from './CustomSelect'
import styles from '../styles/Todas.module.css'

export default function Todas({ participants, phase, setPhase, predictions, actuals }) {
  const [jornada, setJornada] = useState(1)

  let matches
  if (phase === 'G') {
    matches = getMatchesForJornada(MATCHES, jornada)
  } else {
    matches = MATCHES.filter(m => m.ph === phase)
  }

  return (
    <div className={styles.todas}>
      <div className={styles.controls}>
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
        {phase === 'G' && (
          <CustomSelect
            value={jornada}
            onChange={e => setJornada(parseInt(e))}
            label="Jornada:"
            options={[
              { value: 1, label: 'Jornada 1' },
              { value: 2, label: 'Jornada 2' },
              { value: 3, label: 'Jornada 3' },
            ]}
          />
        )}
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
