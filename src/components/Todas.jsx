import { useState, useMemo, useEffect } from 'react'
import { MATCHES } from '../data/matches'
import { TEAMS } from '../data/teams'
import { AVATAR_COLORS } from '../data/colors'
import { getMatchesForJornada } from '../utils/jornadas'
import { generateInitials } from '../utils/initials'
import TodasLayout2 from './TodasLayout2'
import TodasLayout3 from './TodasLayout3'
import styles from '../styles/Todas.module.css'

export default function Todas({ participants, phase, setPhase, predictions, actuals, r16Substitutions, octavosSubstitutions, cuartosSubstitutions, semifinalSubstitutions, tercerPuestoSubstitutions, finalSubstitutions, selectedThirds = {}, availableThirds = {} }) {
  const [layoutView, setLayoutView] = useState(3)
  const initialsMap = useMemo(() => generateInitials(participants), [participants])

  // Detectar jornadas/fases con datos
  const jornadasWithData = [1, 2, 3].filter(j => {
    const jMatches = getMatchesForJornada(MATCHES, j)
    return jMatches.some(m => actuals[m.id] || participants.some(p => predictions[p]?.[m.id]))
  })

  const phasesWithData = ['G', 'R16', 'OCT', 'CTO', 'SEMI', '3P', 'FIN'].filter(ph => {
    const pMatches = ph === 'G' ? getMatchesForJornada(MATCHES, 1) : MATCHES.filter(m => m.ph === ph)
    return pMatches.some(m => actuals[m.id] || participants.some(p => predictions[p]?.[m.id]))
  })

  // Inicializar con la última fase/jornada con datos
  const lastPhaseWithData = phasesWithData.length > 0 ? phasesWithData[phasesWithData.length - 1] : 'G'
  const lastJornada = phase === 'G' ? (jornadasWithData.length > 0 ? jornadasWithData[jornadasWithData.length - 1] : 1) : 1

  const [jornada, setJornada] = useState(lastJornada)

  // Sincronizar phase con la última fase con datos en el primer render
  useEffect(() => {
    if (lastPhaseWithData && phase !== lastPhaseWithData) {
      setPhase(lastPhaseWithData)
    }
  }, [])

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
