import { useState, useMemo } from 'react'
import { MATCHES } from '../data/matches'
import { TEAMS } from '../data/teams'
import { AVATAR_COLORS } from '../data/colors'
import { getMatchesForJornada } from '../utils/jornadas'
import { generateInitials } from '../utils/initials'
import TodasLayout2 from './TodasLayout2'
import TodasLayout3 from './TodasLayout3'
import styles from '../styles/Todas.module.css'

export default function Todas({ participants, phase, setPhase, predictions, actuals, r16Substitutions, octavosSubstitutions, cuartosSubstitutions, semifinalSubstitutions, tercerPuestoSubstitutions, finalSubstitutions, selectedThirds = {}, availableThirds = {} }) {
  const [jornada, setJornada] = useState(1)
  const [layoutView, setLayoutView] = useState(3)
  const initialsMap = useMemo(() => generateInitials(participants), [participants])

  let matches
  if (phase === 'G') {
    matches = getMatchesForJornada(MATCHES, jornada)
  } else {
    matches = MATCHES.filter(m => m.ph === phase)
  }

  // Verificar si hay datos
  const hasPredictions = matches.some(m => participants.some(p => predictions[p]?.[m.id]))
  const hasActuals = matches.some(m => actuals[m.id])
  const hasData = hasPredictions || hasActuals

  return (
    <div className={styles.todas}>
      <div className={styles.layoutTabs}>
        <button
          className={`${styles.tabBtn} ${layoutView === 3 ? styles.tabActive : ''}`}
          onClick={() => setLayoutView(3)}
          disabled={!hasData}
        >
          Partidos
        </button>
        <button
          className={`${styles.tabBtn} ${layoutView === 2 ? styles.tabActive : ''}`}
          onClick={() => setLayoutView(2)}
          disabled={!hasData}
        >
          Aciertos
        </button>
      </div>

      {hasData ? (
        <div className={styles.layoutContent}>
          {layoutView === 2 && (
            <TodasLayout2
              participants={participants}
              phase={phase}
              jornada={jornada}
              predictions={predictions}
              actuals={actuals}
            />
          )}
          {layoutView === 3 && (
            <TodasLayout3
              participants={participants}
              phase={phase}
              setPhase={setPhase}
              jornada={jornada}
              setJornada={setJornada}
              predictions={predictions}
              actuals={actuals}
              r16Substitutions={r16Substitutions}
              octavosSubstitutions={octavosSubstitutions}
              cuartosSubstitutions={cuartosSubstitutions}
              semifinalSubstitutions={semifinalSubstitutions}
              tercerPuestoSubstitutions={tercerPuestoSubstitutions}
              finalSubstitutions={finalSubstitutions}
              selectedThirds={selectedThirds}
              availableThirds={availableThirds}
            />
          )}
        </div>
      ) : (
        <div className={styles.noData}>Sin datos en esta fase/jornada</div>
      )}
    </div>
  )
}
