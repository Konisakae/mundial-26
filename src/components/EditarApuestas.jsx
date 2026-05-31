import { useState, useMemo } from 'react'
import { MATCHES } from '../data/matches'
import { getMatchesForJornada } from '../utils/jornadas'
import { generateInitials } from '../utils/initials'
import { AVATAR_COLORS } from '../data/colors'
import MatchCard from './MatchCard'
import CustomSelect from './CustomSelect'
import styles from '../styles/Apuestas.module.css'

export default function EditarApuestas({
  participants = [],
  selectedParticipant,
  setSelectedParticipant,
  phase,
  setPhase,
  predictions,
  savePred,
  setPredictedWinner,
  actuals,
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

  const pIdx = selectedParticipant ? participants.indexOf(selectedParticipant) : -1
  const pAv = pIdx >= 0 ? AVATAR_COLORS[pIdx % AVATAR_COLORS.length] : null
  const initialsMap = useMemo(() => generateInitials(participants), [participants])

  if (!selectedParticipant || pAv === null) {
    return (
      <div className={styles.apuestas}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <p>Selecciona un participante para editar sus apuestas</p>
          <div className={styles.participantSelectorContainer}>
            {participants.map((p, i) => {
              const av = AVATAR_COLORS[i % AVATAR_COLORS.length]
              return (
                <button
                  key={p}
                  onClick={() => setSelectedParticipant(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: '2px solid ' + av.b,
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                    color: '#ffffff',
                  }}
                >
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.96rem',
                    fontWeight: 'bold',
                    background: av.b,
                    color: av.t,
                    borderRadius: '0.25rem',
                  }}>
                    {initialsMap[p]}
                  </div>
                  <span style={{ fontSize: '0.88rem' }}>{p}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const userPreds = predictions[selectedParticipant]?.predictions || {}

  // Renderizar sección de jornada (sin restricciones)
  const renderJornada = (j) => {
    const matches = getMatchesForJornada(MATCHES, j)

    return (
      <div key={j} className={styles.jornadaSection}>
        <div className={styles.jornadaHeader}>
          <h3 className={styles.jornadaHeading}>Jornada {j}</h3>
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
                onChange={(field, val) => {
                  savePred(selectedParticipant, match.id, field === 'h' ? parseInt(val) || 0 : pred.h, field === 'a' ? parseInt(val) || 0 : pred.a)
                }}
                actual={actual}
                showActual={true}
                editable={true}
                isConfirmed={false}
                isAdmin={true}
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
                onSetWinner={setPredictedWinner}
                onSetPredictedWinner={setPredictedWinner}
                hideChampionDisplay={true}
              />
            )
          })}
        </div>
      </div>
    )
  }

  // Renderizar fase eliminatoria (sin restricciones)
  const renderEliminationPhase = (phaseName, phaseLabel) => {
    const phaseMatches = MATCHES.filter(m => m.ph === phaseName)

    return (
      <div key={phaseName} className={styles.jornadaSection}>
        <div className={styles.jornadaHeader}>
          <h3 className={styles.jornadaHeading}>{phaseLabel}</h3>
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
                onChange={(field, val) => {
                  savePred(selectedParticipant, match.id, field === 'h' ? parseInt(val) || 0 : pred.h, field === 'a' ? parseInt(val) || 0 : pred.a)
                }}
                actual={actual}
                showActual={true}
                editable={true}
                isConfirmed={false}
                isAdmin={true}
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
                onSetWinner={setPredictedWinner}
                onSetPredictedWinner={setPredictedWinner}
                hideChampionDisplay={true}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.apuestas}>
      <div className={styles.header}>
        <div className={styles.userChip} style={{ background: pAv.b, color: pAv.t }}>
          {initialsMap[selectedParticipant]}
        </div>
        <span>{selectedParticipant}</span>
        <button
          onClick={() => setSelectedParticipant(null)}
          style={{
            marginLeft: 'auto',
            background: 'rgba(255, 100, 100, 0.2)',
            border: '1px solid rgba(255, 100, 100, 0.5)',
            color: '#ff6464',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Cambiar
        </button>
      </div>

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
      ) : (
        <div className={styles.jornadasContainer}>
          {phase === 'R16' && renderEliminationPhase('R16', 'Dieciseisavos')}
          {phase === 'OCT' && renderEliminationPhase('OCT', 'Octavos')}
          {phase === 'CTO' && renderEliminationPhase('CTO', 'Cuartos')}
          {phase === 'SEMI' && renderEliminationPhase('SEMI', 'Semifinales')}
          {phase === '3P' && renderEliminationPhase('3P', '3er Puesto')}
          {phase === 'FIN' && renderEliminationPhase('FIN', 'Final')}
        </div>
      )}
    </div>
  )
}
