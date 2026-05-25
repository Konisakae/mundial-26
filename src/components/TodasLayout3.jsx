import { useState, useMemo, useEffect } from 'react'
import { MATCHES } from '../data/matches'
import { TEAMS } from '../data/teams'
import { getMatchesForJornada } from '../utils/jornadas'
import { calcPts } from '../utils/scoring'
import { AVATAR_COLORS } from '../data/colors'
import { generateInitials } from '../utils/initials'
import styles from '../styles/TodasLayout3.module.css'

export default function TodasLayout3({ participants, phase, jornada, predictions, actuals, r16Substitutions = {}, octavosSubstitutions = {}, cuartosSubstitutions = {}, semifinalSubstitutions = {}, tercerPuestoSubstitutions = {}, finalSubstitutions = {} }) {
  const [expandedParticipant, setExpandedParticipant] = useState(null)
  const initialsMap = useMemo(() => generateInitials(participants), [participants])

  useEffect(() => {
    if (expandedParticipant) {
      const el = document.querySelector(`[data-participant="${expandedParticipant}"]`)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
      }
    }
  }, [expandedParticipant])

  const getTeam = (teamKey) => {
    const substitutions = {
      R16: r16Substitutions,
      OCT: octavosSubstitutions,
      CTO: cuartosSubstitutions,
      SEMI: semifinalSubstitutions,
      '3P': tercerPuestoSubstitutions,
      FIN: finalSubstitutions
    }
    const subs = substitutions[phase] || {}
    const resolvedTeam = subs[teamKey] || teamKey
    return TEAMS[resolvedTeam]
  }

  let matches
  if (phase === 'G') {
    matches = getMatchesForJornada(MATCHES, jornada)
  } else {
    matches = MATCHES.filter(m => m.ph === phase)
  }

  // Calcular stats por participante
  const stats = useMemo(() => {
    const result = {}

    participants.forEach(p => {
      let aciertos = 0, parciales = 0, fallos = 0, puntos = 0

      matches.forEach(m => {
        const pred = predictions[p]?.[m.id]
        const actual = actuals[m.id]

        if (pred && actual) {
          const score = calcPts(pred, actual, m) || 0
          puntos += score

          if (pred.h === actual.h && pred.a === actual.a) {
            aciertos++
          } else if ((Number(pred.h) > Number(pred.a) && Number(actual.h) > Number(actual.a)) ||
                     (Number(pred.h) === Number(pred.a) && Number(actual.h) === Number(actual.a)) ||
                     (Number(pred.h) < Number(pred.a) && Number(actual.h) < Number(actual.a))) {
            parciales++
          } else {
            fallos++
          }
        }
      })

      result[p] = { aciertos, parciales, fallos, puntos }
    })

    return result
  }, [participants, matches, predictions, actuals])

  // Ordenar por puntos
  const sorted = useMemo(() => {
    return [...participants].sort((a, b) => stats[b].puntos - stats[a].puntos)
  }, [participants, stats])

  return (
    <div className={styles.layout3}>
      <div className={styles.participantsList}>
        {sorted.map((p, idx) => {
          const av = AVATAR_COLORS[participants.indexOf(p) % AVATAR_COLORS.length]
          const st = stats[p]
          const isExpanded = expandedParticipant === p

          return (
            <div key={p} className={`${styles.participantItem} ${isExpanded ? styles.expanded : ''} ${idx === 0 ? styles.first : ''}`} data-participant={p}>
              <button
                className={styles.participantHeader}
                onClick={() => setExpandedParticipant(isExpanded ? null : p)}
              >
                <div className={styles.headerLeft}>
                  <div className={styles.avatar} style={{ background: av.b, color: av.t }}>
                    {initialsMap[p]}
                  </div>
                  <span className={styles.name}>{p}</span>
                </div>

                <div className={styles.headerRight}>
                  <div className={styles.stats}>
                    <span className={styles.badge}>{st.aciertos}✓</span>
                    <span className={styles.badge}>{st.parciales}~</span>
                    <span className={styles.badge}>{st.fallos}✗</span>
                  </div>
                  <div className={styles.puntos}>{st.puntos} pts</div>
                  <div className={`${styles.arrow} ${isExpanded ? styles.open : ''}`}>▶</div>
                </div>
              </button>

              {isExpanded && (
                <div className={styles.predictions}>
                  {matches.map((m, mIdx) => {
                    const h = getTeam(m.h)
                    const a = getTeam(m.a)
                    const pred = predictions[p]?.[m.id]
                    const actual = actuals[m.id]
                    const isCorrect = pred && actual && pred.h === actual.h && pred.a === actual.a
                    const matchPoints = pred && actual ? (calcPts(pred, actual, m) || 0) : 0

                    return (
                      <div key={m.id} className={`${styles.matchRow} ${isCorrect ? styles.correct : matchPoints === 0 ? styles.incorrect : matchPoints > 0 ? styles.partial : ''}`}>
                        <div className={styles.matchInfo}>
                          <span className={styles.flag}>{h?.f}</span>
                          <span className={styles.vs}>vs</span>
                          <span className={styles.flag}>{a?.f}</span>
                          <div className={styles.actual}>
                            {actual ? `${actual.h}-${actual.a}` : '—'}
                          </div>
                        </div>

                        <div className={styles.scores}>
                          <div className={styles.prediction}>
                            {pred ? `${pred.h}-${pred.a}` : '—'}
                          </div>
                        </div>

                        <div className={styles.matchPoints}>{matchPoints} pts</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
