import { useState } from 'react'
import { MATCHES } from '../data/matches'
import { getMatchesForJornada } from '../utils/jornadas'
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
  getCurrentJornada,
  confirmJornada,
}) {
  // Para fases no-grupo, usar jornada como dummy variable
  const jornada = phase === 'G' ? (getCurrentJornada ? getCurrentJornada(participant) : 1) : 1

  if (!participant) {
    return <div className={styles.noParticipant}>Selecciona un participante primero</div>
  }

  let matches
  if (phase === 'G') {
    matches = getMatchesForJornada(MATCHES, jornada)
  } else {
    matches = MATCHES.filter(m => m.ph === phase)
  }

  const pIdx = participant ? participant.charCodeAt(0) : 0
  const pAv = AVATAR_COLORS[pIdx % AVATAR_COLORS.length]
  const userPreds = predictions[participant]?.predictions || {}
  const confirmed = predictions[participant]?.confirmed || { 1: false, 2: false, 3: false }
  const isCurrentJornadalConfirmed = confirmed[jornada] || false

  // Validar si todos los partidos de la jornada actual están rellenos
  const allFilled = phase === 'G' && matches.every(m => {
    const pred = userPreds[m.id]
    return pred && pred.h !== '' && pred.h !== undefined && pred.a !== '' && pred.a !== undefined
  })

  const handleConfirmJornada = () => {
    if (allFilled && confirmJornada) {
      confirmJornada(participant, jornada)
    }
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

      {phase === 'G' && (
        <div className={styles.jornadaProgressSection}>
          <div className={styles.jornadaProgress}>
            {[1, 2, 3].map(j => (
              <div key={j} className={styles.jornadaTab}>
                <span className={styles.jornadaLabel}>Jornada {j}</span>
                <span className={styles.jornadaStatus}>
                  {confirmed[j] ? '✓' : j === jornada ? '🔄' : '🔒'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'G' && !isCurrentJornadalConfirmed && (
        <div className={styles.jornadaTitle}>
          Jornada {jornada}
        </div>
      )}

      {phase === 'G' && isCurrentJornadalConfirmed && (
        <div className={styles.jornadaCompleted}>
          ✓ Jornada {jornada} confirmada
        </div>
      )}

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
              isConfirmed={isCurrentJornadalConfirmed}
            />
          )
        })}
      </div>

      {phase === 'G' && !isCurrentJornadalConfirmed && (
        <div className={styles.confirmSection}>
          <button
            onClick={handleConfirmJornada}
            disabled={!allFilled}
            className={styles.confirmBtn}
          >
            Confirmar jornada {jornada}
          </button>
          {!allFilled && (
            <p className={styles.validationMsg}>Rellena todos los partidos para confirmar</p>
          )}
        </div>
      )}
    </div>
  )
}
