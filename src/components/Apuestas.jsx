import { useState, useMemo } from 'react'
import { MATCHES } from '../data/matches'
import { getMatchesForJornada } from '../utils/jornadas'
import { generateInitials } from '../utils/initials'
import { AVATAR_COLORS } from '../data/colors'
import MatchCard from './MatchCard'
import CustomSelect from './CustomSelect'
import styles from '../styles/Apuestas.module.css'

export default function Apuestas({
  participants = [],
  participant,
  phase,
  setPhase,
  group,
  setGroup,
  predictions,
  savePred,
  setPredictedWinner,
  actuals,
  getCurrentJornada,
  confirmJornada,
  confirmR16Prediction,
  confirmEliminationPhase,
  r16Substitutions = {},
  octavosSubstitutions = {},
  octavosGroupInfo = {},
  cuartosSubstitutions = {},
  cuartosGroupInfo = {},
  semifinalSubstitutions = {},
  semifinalGroupInfo = {},
  tercerPuestoSubstitutions = {},
  tercerPuestoGroupInfo = {},
  finalSubstitutions = {},
  finalGroupInfo = {},
  availableThirds = {},
  selectedThirds = {},
  resultsConfirmed = {},
  r16MatchupsConfirmed = false,
  isAdmin = false,
}) {
  const [selectedJornada, setSelectedJornada] = useState(1)
  const currentJornada = phase === 'G' ? (getCurrentJornada ? getCurrentJornada(participant) : 1) : 1

  // Helper para calcular la jornada/fase máxima accesible para participantes
  const getMaxAccessibleJornada = (p) => {
    if (isAdmin) return 3

    for (let j = 3; j >= 1; j--) {
      if (resultsConfirmed[j]) {
        return Math.min(j + 1, 3)
      }
    }
    return 1
  }

  const getMaxAccessiblePhase = (p) => {
    if (isAdmin) return p

    const phaseOrder = { 'R16': 'G', 'OCT': 'R16', 'CTO': 'OCT', 'SEMI': 'CTO', '3P': 'SEMI', 'FIN': 'SEMI' }
    const phaseOrderReverse = { 'G': 'R16', 'R16': 'OCT', 'OCT': 'CTO', 'CTO': 'SEMI', 'SEMI': ['3P', 'FIN'] }

    // Si es fase G, usa la jornada máxima accesible
    if (p === 'G') {
      return getMaxAccessibleJornada(participant) <= 3
    }

    // Para fases eliminatorias, verifica si la fase anterior está confirmada
    const prevPhase = phaseOrder[p]
    if (!prevPhase) return false

    if (p === 'R16') {
      return resultsConfirmed[1] && resultsConfirmed[2] && resultsConfirmed[3] && r16MatchupsConfirmed
    }

    return !!(resultsConfirmed[prevPhase])
  }

  const pIdx = participant ? participants.indexOf(participant) : -1
  const pAv = pIdx >= 0 ? AVATAR_COLORS[pIdx % AVATAR_COLORS.length] : null
  const initialsMap = useMemo(() => generateInitials(participants), [participants])

  if (!participant || pAv === null) {
    return <div className={styles.noParticipant}>Selecciona un participante primero</div>
  }
  const userPreds = predictions[participant]?.predictions || {}
  const confirmed = predictions[participant]?.confirmed || { 1: false, 2: false, 3: false }

  // Verificar si una fase está completada en predicciones
  const isPhasePredictionCompleted = (phaseName) => {
    const phaseMatches = MATCHES.filter(m => m.ph === phaseName)
    return phaseMatches.every(m => {
      const pred = userPreds[m.id]
      if (!pred || pred.h === '' || pred.h === undefined || pred.a === '' || pred.a === undefined) {
        return false
      }
      // En fases eliminatorias, si hay empate debe haber ganador seleccionado
      if (pred.h === pred.a && !pred.winner) {
        return false
      }
      return true
    })
  }

  const isPhaseActualsCompleted = (phaseName) => {
    const phaseMatches = MATCHES.filter(m => m.ph === phaseName)
    return phaseMatches.every(m => {
      const actual = actuals[m.id]
      return actual && actual.h !== undefined && actual.h !== '' && actual.a !== undefined && actual.a !== ''
    })
  }

  // Determinar si fase anterior está completada
  const isPreviousPhaseCompleted = (currentPhase) => {
    const phaseOrder = { 'R16': 'G', 'OCT': 'R16', 'CTO': 'OCT', 'SEMI': 'CTO', '3P': 'SEMI', 'FIN': 'SEMI' }
    const prevPhase = phaseOrder[currentPhase]
    if (!prevPhase) return false

    // Para R16: jornadas confirmadas en resultados + enfrentamientos confirmados
    if (currentPhase === 'R16') {
      return resultsConfirmed[1] && resultsConfirmed[2] && resultsConfirmed[3] && r16MatchupsConfirmed
    }

    // Para otras fases: fase anterior confirmada en predicciones Y resultados
    return !!(confirmed[prevPhase] && resultsConfirmed[prevPhase])
  }

  // Renderizar fase eliminatoria con estados
  const renderEliminationPhase = (phaseName, phaseLabel) => {
    // Verificar si participante tiene acceso a esta fase
    if (!isAdmin) {
      const phaseOrder = { 'R16': 'G', 'OCT': 'R16', 'CTO': 'OCT', 'SEMI': 'CTO', '3P': 'SEMI', 'FIN': 'SEMI' }
      const prevPhase = phaseOrder[phaseName]

      if (phaseName === 'R16') {
        const canAccessR16 = resultsConfirmed[1] && resultsConfirmed[2] && resultsConfirmed[3] && r16MatchupsConfirmed
        if (!canAccessR16) {
          return (
            <div className={styles.accessDenied}>
              <p>No puedes ver esta fase aún. Completa todas las jornadas de grupos en resultados.</p>
            </div>
          )
        }
      } else if (prevPhase && !resultsConfirmed[prevPhase]) {
        return (
          <div className={styles.accessDenied}>
            <p>No puedes ver esta fase aún. Completa la fase anterior en resultados.</p>
          </div>
        )
      }
    }

    const phaseMatches = MATCHES.filter(m => m.ph === phaseName)
    const allFilled = isPhasePredictionCompleted(phaseName)
    const allCompleted = isPhaseActualsCompleted(phaseName)
    const prevCompleted = isPreviousPhaseCompleted(phaseName)
    const phaseConfirmed = confirmed[phaseName] || false

    let status = 'pendiente'
    let borderClass = styles.jornadaDefault
    if (phaseConfirmed) {
      status = 'confirmado'
      borderClass = styles.jornadaConfirmed
    } else if (prevCompleted) {
      status = 'progreso'
      borderClass = styles.jornadaCurrent
    }

    const handleConfirm = () => {
      // Validación adicional: verificar que todos los ganadores en empates estén seleccionados
      const allWinnersSelected = phaseMatches.every(m => {
        const pred = userPreds[m.id]
        if (!pred || pred.h === '' || pred.h === undefined || pred.a === '' || pred.a === undefined) {
          return false
        }
        if (pred.h === pred.a && !pred.winner) {
          return false
        }
        return true
      })

      if (allWinnersSelected && confirmEliminationPhase) {
        confirmEliminationPhase(participant, phaseName)
      }
    }

    const allWinnersSelected = phaseMatches.every(m => {
      const pred = userPreds[m.id]
      if (!pred || pred.h === '' || pred.h === undefined || pred.a === '' || pred.a === undefined) {
        return false
      }
      if (pred.h === pred.a && !pred.winner) {
        return false
      }
      return true
    })

    const badgeClass = status === 'confirmado' ? styles.badge : status === 'progreso' ? styles.badgeCurrent : styles.badgeBlocked
    const badgeText = status === 'confirmado' ? '✓ Confirmado' : status === 'progreso' ? 'En progreso' : 'Pendiente'

    const showConfirmButtonBottom = !['SEMI', '3P', 'FIN'].includes(phaseName)
    const confirmSection = status === 'progreso' && status !== 'confirmado' && (
      <div className={styles.confirmSection}>
        <button
          onClick={handleConfirm}
          disabled={!allWinnersSelected}
          className={styles.confirmBtn}
        >
          Confirmar {phaseLabel.toLowerCase()}
        </button>
        {!allWinnersSelected && (
          <p className={styles.validationMsg}>{!allFilled ? 'Rellena todos los partidos para confirmar' : 'Selecciona ganadores en empates'}</p>
        )}
      </div>
    )

    const confirmSectionBottom = showConfirmButtonBottom && confirmSection

    return (
      <div className={`${styles.jornadaSection} ${borderClass}`}>
        <div className={styles.jornadaHeader}>
          <h3 className={styles.jornadaHeading}>
            {phaseLabel}
            <span className={badgeClass}>{badgeText}</span>
          </h3>
        </div>

        {confirmSection}

        <div className={styles.matches}>
          {phaseMatches.map(match => {
            const pred = userPreds[match.id] || { h: '', a: '' }
            const actual = actuals[match.id]
            const isBlocked = !isAdmin && status === 'pendiente'

            return (
              <MatchCard
                key={match.id}
                match={match}
                value={pred}
                onChange={(field, val) => !isBlocked && savePred(match.id, field === 'h' ? parseInt(val) || 0 : pred.h, field === 'a' ? parseInt(val) || 0 : pred.a)}
                actual={actual}
                showActual={true}
                editable={!isBlocked}
                isConfirmed={isBlocked || status === 'confirmado'}
                r16Substitutions={r16Substitutions}
                octavosSubstitutions={octavosSubstitutions}
                octavosGroupInfo={octavosGroupInfo}
                cuartosSubstitutions={cuartosSubstitutions}
                cuartosGroupInfo={cuartosGroupInfo}
                semifinalSubstitutions={semifinalSubstitutions}
                semifinalGroupInfo={semifinalGroupInfo}
                tercerPuestoSubstitutions={tercerPuestoSubstitutions}
                tercerPuestoGroupInfo={tercerPuestoGroupInfo}
                finalSubstitutions={finalSubstitutions}
                finalGroupInfo={finalGroupInfo}
                selectedThirds={selectedThirds}
                availableThirds={availableThirds}
                onSetPredictedWinner={setPredictedWinner}
                hideChampionDisplay={true}
              />
            )
          })}
        </div>

        {confirmSectionBottom}
      </div>
    )
  }

  // Renderizar sección de jornada
  const renderJornada = (j) => {
    const maxAccessibleJornada = getMaxAccessibleJornada(participant)
    const isAccessible = isAdmin || j <= maxAccessibleJornada

    // Si participante intenta ver jornada no accesible, mostrar mensaje
    if (!isAccessible) {
      return (
        <div className={styles.accessDenied}>
          <p>No puedes ver esta jornada aún. Completa las jornadas anteriores en resultados.</p>
        </div>
      )
    }

    const matches = getMatchesForJornada(MATCHES, j)
    const isConfirmed = confirmed[j]
    const prevJornada = j - 1
    const isPrevResultsConfirmed = prevJornada < 1 || resultsConfirmed[prevJornada]
    const isCurrent = j === currentJornada && isPrevResultsConfirmed
    const isBlocked = !isAdmin && !isConfirmed && !isCurrent

    // Validar si todos los partidos están rellenos
    const allFilled = matches.every(m => {
      const pred = userPreds[m.id]
      return pred && pred.h !== '' && pred.h !== undefined && pred.a !== '' && pred.a !== undefined
    })

    const handleConfirm = () => {
      if (allFilled && confirmJornada) {
        confirmJornada(participant, j)
      }
    }

    // Determinar clase de borde
    let borderClass = styles.jornadaDefault
    if (isConfirmed) borderClass = styles.jornadaConfirmed
    if (isCurrent && !isConfirmed) borderClass = styles.jornadaCurrent
    if (isBlocked) borderClass = styles.jornadaBlocked

    const confirmSection = isCurrent && !isConfirmed && (
      <div className={styles.confirmSection}>
        <button
          onClick={handleConfirm}
          disabled={!allFilled}
          className={styles.confirmBtn}
        >
          Confirmar jornada {j}
        </button>
        {!allFilled && (
          <p className={styles.validationMsg}>Rellena todos los partidos para confirmar</p>
        )}
      </div>
    )

    return (
      <div key={j} className={`${styles.jornadaSection} ${borderClass}`}>
        <div className={styles.jornadaHeader}>
          <h3 className={styles.jornadaHeading}>
            Jornada {j}
            {isConfirmed && <span className={styles.badge}>✓ Confirmada</span>}
            {isCurrent && !isConfirmed && <span className={styles.badgeCurrent}>En progreso</span>}
            {isBlocked && <span className={styles.badgeBlocked}>Pendiente</span>}
          </h3>
        </div>

        {confirmSection}

        <div className={styles.matches}>
          {matches.map(match => {
            const pred = userPreds[match.id] || { h: '', a: '' }
            const actual = actuals[match.id]

            return (
              <MatchCard
                key={match.id}
                match={match}
                value={pred}
                onChange={(field, val) => {
                  if (!isBlocked) {
                    savePred(match.id, field === 'h' ? parseInt(val) || 0 : pred.h, field === 'a' ? parseInt(val) || 0 : pred.a)
                  }
                }}
                actual={actual}
                showActual={true}
                editable={!isBlocked}
                isConfirmed={isConfirmed || isBlocked}
                r16Substitutions={r16Substitutions}
                octavosSubstitutions={octavosSubstitutions}
                octavosGroupInfo={octavosGroupInfo}
                cuartosSubstitutions={cuartosSubstitutions}
                cuartosGroupInfo={cuartosGroupInfo}
                semifinalSubstitutions={semifinalSubstitutions}
                semifinalGroupInfo={semifinalGroupInfo}
                tercerPuestoSubstitutions={tercerPuestoSubstitutions}
                tercerPuestoGroupInfo={tercerPuestoGroupInfo}
                finalSubstitutions={finalSubstitutions}
                finalGroupInfo={finalGroupInfo}
                selectedThirds={selectedThirds}
                availableThirds={availableThirds}
                onSetPredictedWinner={setPredictedWinner}
                hideChampionDisplay={true}
              />
            )
          })}
        </div>

        {confirmSection}
      </div>
    )
  }

  if (!participant) {
    return <div className={styles.noParticipant}>Selecciona un participante primero</div>
  }

  return (
    <div className={styles.apuestas}>
      <div className={styles.header}>
        <div className={styles.userChip} style={{ background: pAv.b, color: pAv.t }}>
          {initialsMap[participant]}
        </div>
        <span>{participant}</span>
      </div>

      <div className={styles.controls}>
        {(() => {
          const maxAccessibleJornada = getMaxAccessibleJornada(participant)
          const allPhaseOptions = [
            { value: 'G', label: 'Grupos' },
            { value: 'R16', label: 'Dieciseisavos' },
            { value: 'OCT', label: 'Octavos' },
            { value: 'CTO', label: 'Cuartos' },
            { value: 'SEMI', label: 'Semifinales' },
            { value: '3P', label: '3er Puesto' },
            { value: 'FIN', label: 'Final' },
          ]

          // Filtrar fases accesibles para participantes
          const accessiblePhases = isAdmin ? allPhaseOptions : allPhaseOptions.filter(opt => {
            if (opt.value === 'G') return true
            if (opt.value === 'R16') return resultsConfirmed[1] && resultsConfirmed[2] && resultsConfirmed[3] && r16MatchupsConfirmed
            const phaseOrder = { 'OCT': 'R16', 'CTO': 'OCT', 'SEMI': 'CTO', '3P': 'SEMI', 'FIN': 'SEMI' }
            const prevPhase = phaseOrder[opt.value]
            return !!(resultsConfirmed[prevPhase])
          })

          return (
            <CustomSelect
              value={phase}
              onChange={setPhase}
              label="Ronda:"
              options={accessiblePhases}
            />
          )
        })()}

        {phase === 'G' && (
          (() => {
            const maxAccessibleJornada = getMaxAccessibleJornada(participant)
            const allJornadaOptions = [
              { value: 1, label: 'Jornada 1' },
              { value: 2, label: 'Jornada 2' },
              { value: 3, label: 'Jornada 3' },
            ]

            const accessibleJornadas = isAdmin ? allJornadaOptions : allJornadaOptions.filter(opt => opt.value <= maxAccessibleJornada)

            return (
              <CustomSelect
                value={selectedJornada}
                onChange={setSelectedJornada}
                label="Jornada:"
                options={accessibleJornadas}
              />
            )
          })()
        )}
      </div>

      {phase === 'G' ? (
        <div className={styles.jornadasContainer}>
          {renderJornada(selectedJornada)}
        </div>
      ) : phase === 'R16' ? (
        (() => {
          const r16Matches = MATCHES.filter(m => m.ph === 'R16')
          const allFilled = r16Matches.every(m => {
            const pred = userPreds[m.id]
            return pred && pred.h !== '' && pred.h !== undefined && pred.a !== '' && pred.a !== undefined
          })
          const allCompleted = r16Matches.every(m => {
            const actual = actuals[m.id]
            return actual && actual.h !== undefined && actual.h !== '' && actual.a !== undefined && actual.a !== ''
          })
          const prevCompleted = isPreviousPhaseCompleted('R16')
          const r16Confirmed = confirmed['R16'] || false

          let status = 'pendiente'
          let borderClass = styles.jornadaDefault
          if (r16Confirmed) {
            status = 'confirmado'
            borderClass = styles.jornadaConfirmed
          } else if (prevCompleted) {
            status = 'progreso'
            borderClass = styles.jornadaCurrent
          }

          const badgeClass = status === 'confirmado' ? styles.badge : status === 'progreso' ? styles.badgeCurrent : styles.badgeBlocked
          const badgeText = status === 'confirmado' ? '✓ Confirmado' : status === 'progreso' ? 'En progreso' : 'Pendiente'

          const allWinnersSelected = r16Matches.every(m => {
            const pred = userPreds[m.id]
            if (!pred || pred.h === '' || pred.h === undefined || pred.a === '' || pred.a === undefined) {
              return false
            }
            if (pred.h === pred.a && !pred.winner) {
              return false
            }
            return true
          })

          const handleConfirm = () => {
            if (allWinnersSelected && confirmR16Prediction) {
              confirmR16Prediction(participant)
            }
          }

          const confirmSection = status === 'progreso' && status !== 'confirmado' && (
            <div className={styles.confirmSection}>
              <button
                onClick={handleConfirm}
                disabled={!allWinnersSelected}
                className={styles.confirmBtn}
              >
                Confirmar dieciseisavos
              </button>
              {!allWinnersSelected && (
                <p className={styles.validationMsg}>{!allFilled ? 'Rellena todos los partidos para confirmar' : 'Selecciona ganadores en empates'}</p>
              )}
            </div>
          )

          return (
            <div className={`${styles.jornadaSection} ${borderClass}`}>
              <div className={styles.jornadaHeader}>
                <h3 className={styles.jornadaHeading}>
                  Dieciseisavos
                  <span className={badgeClass}>{badgeText}</span>
                </h3>
              </div>

              {!r16MatchupsConfirmed && prevCompleted && (
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(0, 217, 255, 0.1)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '0.375rem',
                  color: '#00d9ff',
                  marginBottom: '1rem',
                  fontSize: '0.875rem'
                }}>
                  ℹ️ Los enfrentamientos de Dieciseisavos están siendo confirmados. Los equipos se mostrarán una vez estén listos.
                </div>
              )}

              {confirmSection}

              <div className={styles.matches}>
            {MATCHES.filter(m => m.ph === phase).map(match => {
              const pred = userPreds[match.id] || { h: '', a: '' }
              const actual = actuals[match.id]
              const isBlocked = status === 'pendiente'

              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  value={pred}
                  onChange={(field, val) => !isBlocked && savePred(match.id, field === 'h' ? parseInt(val) || 0 : pred.h, field === 'a' ? parseInt(val) || 0 : pred.a)}
                  actual={actual}
                  showActual={true}
                  editable={!isBlocked}
                  isConfirmed={isBlocked || status === 'confirmado'}
                  r16Substitutions={r16Substitutions}
                  octavosSubstitutions={octavosSubstitutions}
                  octavosGroupInfo={octavosGroupInfo}
                  cuartosSubstitutions={cuartosSubstitutions}
                  cuartosGroupInfo={cuartosGroupInfo}
                  semifinalSubstitutions={semifinalSubstitutions}
                  semifinalGroupInfo={semifinalGroupInfo}
                  tercerPuestoSubstitutions={tercerPuestoSubstitutions}
                  tercerPuestoGroupInfo={tercerPuestoGroupInfo}
                  finalSubstitutions={finalSubstitutions}
                  finalGroupInfo={finalGroupInfo}
                  selectedThirds={selectedThirds}
                  availableThirds={availableThirds}
                  onSetPredictedWinner={setPredictedWinner}
                />
              )
              })}
              </div>

              {confirmSection}
            </div>
          )
        })()
      ) : phase === 'OCT' ? renderEliminationPhase('OCT', 'Octavos')
      : phase === 'CTO' ? renderEliminationPhase('CTO', 'Cuartos')
      : phase === 'SEMI' ? renderEliminationPhase('SEMI', 'Semifinales')
      : phase === '3P' ? renderEliminationPhase('3P', '3er Puesto')
      : renderEliminationPhase('FIN', 'Final')}
    </div>
  )
}
