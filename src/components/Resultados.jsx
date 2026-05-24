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
    </div>
  )
}
