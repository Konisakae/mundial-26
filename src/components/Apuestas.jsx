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
  actuals,
  getCurrentJornada,
  confirmJornada,
  r16Substitutions = {},
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
                availableThirds={availableThirds}
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
      </div>

      {phase === 'G' && (
        <div className={styles.jornadaTabs}>
          {[1, 2, 3].map(j => (
            <button
              key={j}
              onClick={() => setSelectedJornada(j)}
              className={`${styles.tabBtn} ${selectedJornada === j ? styles.tabActive : ''} ${confirmed[j] ? styles.tabConfirmed : j === currentJornada ? styles.tabCurrent : styles.tabPending}`}
            >
              Jornada {j}
              <span className={styles.tabIcon}>
                {confirmed[j] ? '✓' : j === currentJornada ? '🔄' : '🔒'}
              </span>
            </button>
          ))}
        </div>
      )}

      {phase === 'G' ? (
        <div className={styles.jornadasContainer}>
          {renderJornada(selectedJornada)}
        </div>
      ) : (
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
                selectedThirds={selectedThirds}
                availableThirds={availableThirds}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
