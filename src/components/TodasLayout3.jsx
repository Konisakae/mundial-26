import { useState, useMemo, useEffect } from 'react'
import { MATCHES } from '../data/matches'
import { TEAMS } from '../data/teams'
import { getMatchesForJornada } from '../utils/jornadas'
import { calcPts } from '../utils/scoring'
import { AVATAR_COLORS } from '../data/colors'
import { generateInitials } from '../utils/initials'
import Flag from './Flag'
import CustomSelect from './CustomSelect'
import styles from '../styles/TodasLayout3.module.css'

export default function TodasLayout3({ participants, phase, setPhase, jornada, setJornada, predictions, actuals, r16Substitutions = {}, octavosSubstitutions = {}, cuartosSubstitutions = {}, semifinalSubstitutions = {}, tercerPuestoSubstitutions = {}, finalSubstitutions = {}, selectedThirds = {}, availableThirds = {} }) {
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

  const getTeam = (teamKey, matchId) => {
    // Manejar referencias a terceros (ej: "3.º A/B/C")
    if (teamKey && teamKey.includes('3.º')) {
      const match = teamKey.match(/3\.º\s*(.+)/i)
      if (match) {
        const options = match[1].split('/').map(g => g.trim())
        const selectedGroup = selectedThirds[matchId]
        if (selectedGroup && options.includes(selectedGroup)) {
          const teamCode = availableThirds[selectedGroup]
          return teamCode ? TEAMS[teamCode] : null
        }
      }
      return null
    }

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

  // Detectar jornadas/fases con datos
  const jornadasWithData = [1, 2, 3].filter(j => {
    const jMatches = getMatchesForJornada(MATCHES, j)
    return jMatches.some(m => actuals[m.id] || participants.some(p => predictions[p]?.[m.id]))
  })

  const phasesWithData = ['G', 'R16', 'OCT', 'CTO', 'SEMI', '3P', 'FIN'].filter(ph => {
    const pMatches = ph === 'G' ? getMatchesForJornada(MATCHES, jornada) : MATCHES.filter(m => m.ph === ph)
    return pMatches.some(m => actuals[m.id] || participants.some(p => predictions[p]?.[m.id]))
  })

  // Si la jornada actual no tiene datos, cambiar a la primera que sí tenga
  useEffect(() => {
    if (phase === 'G' && !jornadasWithData.includes(jornada) && jornadasWithData.length > 0) {
      setJornada(jornadasWithData[0])
    }
  }, [phase, jornada, jornadasWithData])

  // Si la fase actual no tiene datos, cambiar a la primera que sí tenga
  useEffect(() => {
    if (phase !== 'G' && !phasesWithData.includes(phase) && phasesWithData.length > 0) {
      const firstPhaseWithData = phasesWithData.find(p => p !== 'G')
      if (firstPhaseWithData) setPhase(firstPhaseWithData)
    }
  }, [phasesWithData])

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
      <div className={styles.controls}>
        <CustomSelect
          value={phase}
          onChange={setPhase}
          label="Ronda:"
          options={[
            { value: 'G', label: 'Grupos' },
            { value: 'R16', label: 'Dieciseisavos' },
            { value: 'OCT', label: 'Octavos' },
            { value: 'CTO', label: 'Cuartos' },
            { value: 'SEMI', label: 'Semifinales' },
            { value: '3P', label: '3er Puesto' },
            { value: 'FIN', label: 'Final' },
          ].filter(opt => phasesWithData.includes(opt.value))}
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
            ].filter(opt => jornadasWithData.includes(opt.value))}
          />
        )}
      </div>
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
                  {matches.filter(m => actuals[m.id]).map((m, mIdx) => {
                    const h = getTeam(m.h, m.id)
                    const a = getTeam(m.a, m.id)
                    const pred = predictions[p]?.[m.id]
                    const actual = actuals[m.id]
                    const isCorrect = pred && actual && pred.h === actual.h && pred.a === actual.a
                    const matchPoints = pred && actual ? (calcPts(pred, actual, m) || 0) : 0

                    // En eliminatorias, determinar ganador
                    const isElimination = m.ph !== 'G'
                    let winner = null
                    if (isElimination && actual) {
                      if (actual.h > actual.a) winner = 'h'
                      else if (actual.a > actual.h) winner = 'a'
                      else if (actual.winner) winner = actual.winner
                    }

                    return (
                      <div key={m.id} className={`${styles.matchRow} ${isCorrect ? styles.correct : actual && matchPoints === 0 ? styles.incorrect : matchPoints > 0 ? styles.partial : ''}`}>
                        <div className={styles.matchInfo}>
                          <span className={styles.flag}>{h && <Flag teamCode={h.c} size="1.5rem" />}</span>
                          <span className={styles.vs}>vs</span>
                          <span className={styles.flag}>{a && <Flag teamCode={a.c} size="1.5rem" />}</span>
                          <div className={styles.actual}>
                            {actual ? (
                              <>
                                <span className={winner === 'h' ? styles.winnerScore : winner === 'a' ? styles.loserScore : ''}>
                                  {actual.h}
                                </span>
                                -
                                <span className={winner === 'a' ? styles.winnerScore : winner === 'h' ? styles.loserScore : ''}>
                                  {actual.a}
                                </span>
                              </>
                            ) : (
                              '—'
                            )}
                          </div>
                        </div>

                        <div className={styles.scores}>
                          <div className={styles.prediction}>
                            {pred ? (
                              <>
                                {isElimination && (pred.h > pred.a || pred.a > pred.h || pred.winner) ? (
                                  <>
                                    <span className={pred.h > pred.a || pred.winner === 'h' ? styles.winnerScore : pred.a > pred.h || pred.winner === 'a' ? styles.loserScore : ''}>
                                      {pred.h}
                                    </span>
                                    -
                                    <span className={pred.a > pred.h || pred.winner === 'a' ? styles.winnerScore : pred.h > pred.a || pred.winner === 'h' ? styles.loserScore : ''}>
                                      {pred.a}
                                    </span>
                                  </>
                                ) : (
                                  `${pred.h}-${pred.a}`
                                )}
                              </>
                            ) : (
                              '—'
                            )}
                          </div>
                        </div>

                        <div className={styles.matchPoints}>{actual ? `${matchPoints} pts` : '—'}</div>
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
