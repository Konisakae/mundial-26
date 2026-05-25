import { useState } from 'react'
import { MATCHES } from '../data/matches'
import { getMatchesForJornada, JORNADAS } from '../utils/jornadas'
import MatchCard from './MatchCard'
import CustomSelect from './CustomSelect'
import styles from '../styles/Resultados.module.css'

export default function Resultados({
  phase, setPhase, group, setGroup, actuals, saveActual, setWinner, isAdmin, r16Substitutions,
  octavosSubstitutions, octavosGroupInfo, cuartosSubstitutions, cuartosGroupInfo, semifinalSubstitutions, semifinalGroupInfo,
  tercerPuestoSubstitutions, tercerPuestoGroupInfo, finalSubstitutions, finalGroupInfo, r16Confirmed, confirmR16, selectedThirds, availableThirds, onSelectThird, simulatedJornadas,
  resultsConfirmed = {}, confirmResults = null, r16MatchupsConfirmed = false, confirmR16Matchups = null,
}) {
  const [editing, setEditing] = useState({})
  const [jornada, setJornada] = useState(1)

  let matches
  if (phase === 'G') {
    matches = getMatchesForJornada(MATCHES, jornada)
  } else {
    matches = MATCHES.filter(m => m.ph === phase)
  }

  const handleInputChange = (matchId, field, value) => {
    const curr = editing[matchId] || actuals[matchId] || { h: '', a: '' }
    const updated = { ...curr, [field]: value }
    setEditing({ ...editing, [matchId]: updated })
  }

  const handleSave = (matchId) => {
    const data = editing[matchId]
    if (data) {
      saveActual(matchId, parseInt(data.h) || 0, parseInt(data.a) || 0)
      setEditing({ ...editing, [matchId]: undefined })
    }
  }

  const handleReset = (matchId) => {
    saveActual(matchId, undefined, undefined)
    setEditing({ ...editing, [matchId]: undefined })
  }

  // Verificar si todos los matches de la fase/jornada actual están rellenos
  const areAllMatchesFilled = () => {
    return matches.every(m => {
      const actual = actuals[m.id]
      return actual && actual.h !== undefined && actual.h !== '' && actual.a !== undefined && actual.a !== ''
    })
  }

  // Obtener identificador de la jornada/fase actual
  const getCurrentPhaseId = () => {
    return phase === 'G' ? jornada : phase
  }

  // Para R16: contar terceros seleccionados
  const getSelectedThirdsCount = () => {
    return Object.keys(selectedThirds).filter(k => k !== 'completed').length
  }

  return (
    <div className={styles.resultados}>
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
          const actual = actuals[match.id]
          const editing_data = editing[match.id]
          const groupsCompleted = simulatedJornadas[1] && simulatedJornadas[2] && simulatedJornadas[3]

          return (
            <MatchCard
              key={match.id}
              match={match}
              value={isAdmin && !actual ? editing_data : null}
              onChange={isAdmin && !actual ? (field, val) => handleInputChange(match.id, field, val) : null}
              onReset={isAdmin && actual ? () => handleReset(match.id) : null}
              actual={actual}
              showActual={false}
              editable={isAdmin && !actual}
              saveBtn={isAdmin && !actual ? () => handleSave(match.id) : null}
              resetBtn={isAdmin && actual ? () => handleReset(match.id) : null}
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
              onSelectThird={onSelectThird}
              isAdmin={isAdmin}
              groupsCompleted={groupsCompleted}
              onSetWinner={setWinner}
            />
          )
        })}
      </div>

      {isAdmin && (
        <div className={styles.confirmSection}>
          {areAllMatchesFilled() && (
            <button
              onClick={() => confirmResults && confirmResults(getCurrentPhaseId())}
              disabled={resultsConfirmed[getCurrentPhaseId()]}
              className={styles.confirmBtn}
            >
              {resultsConfirmed[getCurrentPhaseId()] ? '✓ Confirmado' : 'Confirmar resultados'}
            </button>
          )}

          {phase === 'R16' && (
            <button
              onClick={() => confirmR16Matchups && confirmR16Matchups()}
              disabled={r16MatchupsConfirmed}
              className={styles.confirmBtn}
            >
              {r16MatchupsConfirmed ? '✓ Enfrentamientos confirmados' : 'Confirmar enfrentamientos'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
