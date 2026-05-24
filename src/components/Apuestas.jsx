import { useState } from 'react'
import { MATCHES } from '../data/matches'
import { getMatchesForJornada } from '../utils/jornadas'
import { initials } from '../utils/scoring'
import { AVATAR_COLORS } from '../data/colors'
import MatchCard from './MatchCard'
import CustomSelect from './CustomSelect'
import styles from '../styles/Apuestas.module.css'

export default function Apuestas({
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
}) {
  const [selectedJornada, setSelectedJornada] = useState(1)
  const currentJornada = phase === 'G' ? (getCurrentJornada ? getCurrentJornada(participant) : 1) : 1

  if (!participant) {
    return <div className={styles.noParticipant}>Selecciona un participante primero</div>
  }

  const pIdx = participant ? participant.charCodeAt(0) : 0
  const pAv = AVATAR_COLORS[pIdx % AVATAR_COLORS.length]
  const userPreds = predictions[participant]?.predictions || {}
  const confirmed = predictions[participant]?.confirmed || { 1: false, 2: false, 3: false }

  // Verificar si una fase está completada
  const isPhasePredictionCompleted = (phaseName) => {
    const phaseMatches = MATCHES.filter(m => m.ph === phaseName)
    return phaseMatches.every(m => {
      const pred = userPreds[m.id]
      return pred && pred.h !== '' && pred.h !== undefined && pred.a !== '' && pred.a !== undefined
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
    if (prevPhase === 'G') return confirmed[1] && confirmed[2] && confirmed[3]
    return isPhaseActualsCompleted(prevPhase)
  }

  // Renderizar fase eliminatoria con estados
  const renderEliminationPhase = (phaseName, phaseLabel) => {
    const phaseMatches = MATCHES.filter(m => m.ph === phaseName)
    const allFilled = isPhasePredictionCompleted(phaseName)
    const allCompleted = isPhaseActualsCompleted(phaseName)
    const prevCompleted = isPreviousPhaseCompleted(phaseName)

    let status = prevCompleted ? 'progreso' : 'pendiente'
    let borderClass = styles.jornadaDefault
    if (allCompleted) {
      status = 'confirmado'
      borderClass = styles.jornadaConfirmed
    } else if (allFilled || prevCompleted) {
      status = 'progreso'
      borderClass = styles.jornadaCurrent
    }

    const badgeClass = status === 'confirmado' ? styles.badge : status === 'progreso' ? styles.badgeCurrent : styles.badgeBlocked
    const badgeText = status === 'confirmado' ? '✓ Confirmado' : status === 'progreso' ? 'En progreso' : 'Pendiente'

    return (
      <div className={`${styles.jornadaSection} ${borderClass}`}>
        <div className={styles.jornadaHeader}>
          <h3 className={styles.jornadaHeading}>
            {phaseLabel}
            <span className={badgeClass}>{badgeText}</span>
          </h3>
        </div>

        <div className={styles.matches}>
          {phaseMatches.map(match => {
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
      </div>
    )
  }

  // Renderizar sección de jornada
  const renderJornada = (j) => {
    const matches = getMatchesForJornada(MATCHES, j)
    const isConfirmed = confirmed[j]
    const isCurrent = j === currentJornada
    const isBlocked = !isConfirmed && !isCurrent

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
              />
            )
          })}
        </div>

        {confirmSection}
      </div>
    )
  }

  return (
    <div className={styles.apuestas}>
      <div className={styles.header}>
        <div className={styles.userChip} style={{ background: pAv.b, color: pAv.t }}>
          {initials(participant)}
        </div>
        <span>{participant}</span>
      </div>

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
            { value: '3P', label: 'Tercer Puesto' },
            { value: 'FIN', label: 'Final' },
          ]}
        />
        {phase === 'G' && (
          <CustomSelect
            value={selectedJornada}
            onChange={setSelectedJornada}
            label="Jornada:"
            options={[
              { value: 1, label: 'Jornada 1' },
              { value: 2, label: 'Jornada 2' },
              { value: 3, label: 'Jornada 3' },
            ]}
          />
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
          const groupsCompleted = confirmed[1] && confirmed[2] && confirmed[3]

          let status = groupsCompleted ? 'progreso' : 'pendiente'
          let borderClass = styles.jornadaDefault
          if (allCompleted) {
            status = 'confirmado'
            borderClass = styles.jornadaConfirmed
          } else if (allFilled || groupsCompleted) {
            status = 'progreso'
            borderClass = styles.jornadaCurrent
          }

          const badgeClass = status === 'confirmado' ? styles.badge : status === 'progreso' ? styles.badgeCurrent : styles.badgeBlocked
          const badgeText = status === 'confirmado' ? '✓ Confirmado' : status === 'progreso' ? 'En progreso' : 'Pendiente'

          return (
            <div className={`${styles.jornadaSection} ${borderClass}`}>
              <div className={styles.jornadaHeader}>
                <h3 className={styles.jornadaHeading}>
                  Dieciseisavos
                  <span className={badgeClass}>{badgeText}</span>
                </h3>
              </div>

              <div className={styles.matches}>
            {MATCHES.filter(m => m.ph === phase).map(match => {
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
            </div>
          )
        })()
      ) : phase === 'OCT' ? renderEliminationPhase('OCT', 'Octavos')
      : phase === 'CTO' ? renderEliminationPhase('CTO', 'Cuartos')
      : phase === 'SEMI' ? renderEliminationPhase('SEMI', 'Semifinales')
      : phase === '3P' ? renderEliminationPhase('3P', 'Tercer Puesto')
      : renderEliminationPhase('FIN', 'Final')}
    </div>
  )
}
