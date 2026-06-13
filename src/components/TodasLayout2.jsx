import { useState, useMemo, useEffect } from 'react'
import { MATCHES } from '../data/matches'
import { TEAMS } from '../data/teams'
import { getMatchesForJornada } from '../utils/jornadas'
import { calcPts } from '../utils/scoring'
import { AVATAR_COLORS } from '../data/colors'
import { generateInitials } from '../utils/initials'
import styles from '../styles/TodasLayout2.module.css'

export default function TodasLayout2({ participants, phase, jornada, predictions, actuals }) {
  const [expandedParticipant, setExpandedParticipant] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480)
  const initialsMap = useMemo(() => generateInitials(participants), [participants])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (expandedParticipant) {
      const el = document.querySelector(`[data-participant="${expandedParticipant}"]`)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
      }
    }
  }, [expandedParticipant])

  // Calcular rankings por jornada y fase
  const rankingsByJornadaPhase = useMemo(() => {
    const rankings = {}
    const tiebreakOrder = ['Lucía', 'Olivia', 'Eva', 'Pablo', 'Lucas', 'Darío', 'Elena', 'Javi', 'Nic', 'Jose', 'Charo', 'Abuelo']

    const sortByPointsThenTiebreak = (entries) => {
      return entries.sort((a, b) => {
        const diff = b[1] - a[1]
        if (diff !== 0) return diff
        // Empate: usar orden de desempate
        const idxA = tiebreakOrder.indexOf(a[0])
        const idxB = tiebreakOrder.indexOf(b[0])
        return idxA - idxB
      })
    }

    // Rankings por jornada (1, 2, 3)
    for (let j = 1; j <= 3; j++) {
      const jornadaMatches = MATCHES.filter(m => m.ph === 'G' && m.id >= (j - 1) * 24 + 1 && m.id <= j * 24)
      const scores = {}

      participants.forEach(p => {
        let pts = 0
        jornadaMatches.forEach(m => {
          const pred = predictions[p]?.[m.id]
          const actual = actuals[m.id]
          if (pred && actual) {
            pts += calcPts(pred, actual, m) || 0
          }
        })
        scores[p] = pts
      })

      const sorted = sortByPointsThenTiebreak(Object.entries(scores))
      sorted.forEach((entry, idx) => {
        rankings[`J${j}-${entry[0]}`] = idx + 1
      })
    }

    // Rankings por fase eliminatoria
    ;['R16', 'OCT', 'CTO', 'SEMI', '3P', 'FIN'].forEach(phase => {
      const phaseMatches = MATCHES.filter(m => m.ph === phase)
      const scores = {}

      participants.forEach(p => {
        let pts = 0
        phaseMatches.forEach(m => {
          const pred = predictions[p]?.[m.id]
          const actual = actuals[m.id]
          if (pred && actual) {
            pts += calcPts(pred, actual, m) || 0
          }
        })
        scores[p] = pts
      })

      const sorted = sortByPointsThenTiebreak(Object.entries(scores))
      sorted.forEach((entry, idx) => {
        rankings[`${phase}-${entry[0]}`] = idx + 1
      })
    })

    return rankings
  }, [participants, predictions, actuals])

  // Calcular stats por participante (TODAS las jornadas/fases)
  const stats = useMemo(() => {
    const result = {}

    participants.forEach(p => {
      let aciertos = 0, parciales = 0, fallos = 0, puntos = 0

      MATCHES.forEach(m => {
        const pred = predictions[p]?.[m.id]
        const actual = actuals[m.id]

        if (pred && actual) {
          const score = calcPts(pred, actual, m) || 0
          puntos += score

          if (score === 5) {
            aciertos++
          } else if (score > 0) {
            parciales++
          } else {
            fallos++
          }
        }
      })

      result[p] = { aciertos, parciales, fallos, puntos }
    })

    return result
  }, [participants, predictions, actuals])

  // Ordenar por puntos
  const sorted = useMemo(() => {
    return [...participants].sort((a, b) => stats[b].puntos - stats[a].puntos)
  }, [participants, stats])

  return (
    <div className={styles.layout2}>
      <div className={styles.cardsGrid}>
        {sorted.map((p, idx) => {
          const av = AVATAR_COLORS[participants.indexOf(p) % AVATAR_COLORS.length]
          const st = stats[p]
          const isExpanded = expandedParticipant === p

          return (
            <div key={p} className={`${styles.card} ${idx === 0 ? styles.first : ''} ${isExpanded ? styles.expanded : ''}`} data-participant={p}>
              <button
                className={styles.cardHeader}
                onClick={() => setExpandedParticipant(isExpanded ? null : p)}
              >
                <div className={styles.headerLeft}>
                  <div className={styles.avatar} style={{ background: av.b, color: av.t }}>
                    {initialsMap[p]}
                  </div>
                  <div className={styles.name}>{p}</div>
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
                  {[1, 2, 3].map((jornada) => {
                    const jornadaMatches = MATCHES.filter(m => m.ph === 'G' && m.id >= (jornada - 1) * 24 + 1 && m.id <= jornada * 24)
                    let jornAciertos = 0, jornParciales = 0, jornFallos = 0, puntosJornada = 0
                    let hasData = false

                    jornadaMatches.forEach(m => {
                      const pred = predictions[p]?.[m.id]
                      const actual = actuals[m.id]

                      if (pred && actual) {
                        hasData = true
                        const score = calcPts(pred, actual, m) || 0
                        puntosJornada += score

                        if (score === 5) {
                          jornAciertos++
                        } else if (score > 0) {
                          jornParciales++
                        } else {
                          jornFallos++
                        }
                      }
                    })

                    if (!hasData) return null

                    const ranking = rankingsByJornadaPhase[`J${jornada}-${p}`] || '-'
                    const rankingClass = ranking === 1 ? styles.rankingFirst : ranking === participants.length ? styles.rankingLast : ''
                    const jornadaLabel = isMobile ? `J${jornada}` : `Jornada ${jornada}`

                    return (
                      <div key={jornada} className={styles.phaseRow}>
                        <div className={styles.phaseLabel}>
                          <span>{jornadaLabel}</span>
                          <div className={`${styles.rankingCircle} ${rankingClass}`}>{ranking}</div>
                        </div>
                        <div className={styles.phaseStats}>
                          <span className={styles.phaseBadge}>{jornAciertos}✓</span>
                          <span className={styles.phaseBadge}>{jornParciales}~</span>
                          <span className={styles.phaseBadge}>{jornFallos}✗</span>
                          <span className={styles.phasePuntos}>{puntosJornada} pts</span>
                        </div>
                      </div>
                    )
                  })}
                  {['R16', 'OCT', 'CTO', 'SEMI', '3P', 'FIN'].map((phase) => {
                    const phaseMatches = MATCHES.filter(m => m.ph === phase)
                    let phaseAciertos = 0, parciales = 0, fallos = 0, puntosPhase = 0
                    let hasData = false

                    phaseMatches.forEach(m => {
                      const pred = predictions[p]?.[m.id]
                      const actual = actuals[m.id]

                      if (pred && actual) {
                        hasData = true
                        const score = calcPts(pred, actual, m) || 0
                        puntosPhase += score

                        if (score === 5) {
                          phaseAciertos++
                        } else if (score > 0) {
                          parciales++
                        } else {
                          fallos++
                        }
                      }
                    })

                    if (!hasData) return null

                    const phaseLabels = { R16: 'Dieciseisavos', OCT: 'Octavos', CTO: 'Cuartos', SEMI: 'Semifinales', '3P': '3er Puesto', FIN: 'Final' }
                    const phaseLabelsShort = { R16: 'R16', OCT: 'R8', CTO: 'R4', SEMI: 'SF', '3P': '3P', FIN: 'F' }
                    const ranking = rankingsByJornadaPhase[`${phase}-${p}`] || '-'
                    const rankingClass = ranking === 1 ? styles.rankingFirst : ranking === participants.length ? styles.rankingLast : ''
                    const phaseLabel = isMobile ? phaseLabelsShort[phase] : phaseLabels[phase]

                    return (
                      <div key={phase} className={styles.phaseRow}>
                        <div className={styles.phaseLabel}>
                          <span>{phaseLabel}</span>
                          <div className={`${styles.rankingCircle} ${rankingClass}`}>{ranking}</div>
                        </div>
                        <div className={styles.phaseStats}>
                          <span className={styles.phaseBadge}>{phaseAciertos}✓</span>
                          <span className={styles.phaseBadge}>{parciales}~</span>
                          <span className={styles.phaseBadge}>{fallos}✗</span>
                          <span className={styles.phasePuntos}>{puntosPhase} pts</span>
                        </div>
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
