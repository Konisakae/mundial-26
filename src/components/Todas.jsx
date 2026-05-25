import { useState, useMemo } from 'react'
import { MATCHES } from '../data/matches'
import { TEAMS } from '../data/teams'
import { AVATAR_COLORS } from '../data/colors'
import { getMatchesForJornada } from '../utils/jornadas'
import { generateInitials } from '../utils/initials'
import CustomSelect from './CustomSelect'
import TodasLayout2 from './TodasLayout2'
import TodasLayout3 from './TodasLayout3'
import styles from '../styles/Todas.module.css'

export default function Todas({ participants, phase, setPhase, predictions, actuals, r16Substitutions, octavosSubstitutions, cuartosSubstitutions, semifinalSubstitutions, tercerPuestoSubstitutions, finalSubstitutions }) {
  const [jornada, setJornada] = useState(1)
  const [layoutView, setLayoutView] = useState(3)
  const initialsMap = useMemo(() => generateInitials(participants), [participants])

  let matches
  if (phase === 'G') {
    matches = getMatchesForJornada(MATCHES, jornada)
  } else {
    matches = MATCHES.filter(m => m.ph === phase)
  }

  return (
    <div className={styles.todas}>
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

      <div className={styles.layoutTabs}>
        <button
          className={`${styles.tabBtn} ${layoutView === 3 ? styles.tabActive : ''}`}
          onClick={() => setLayoutView(3)}
        >
          Todas 3 (Expandible)
        </button>
        <button
          className={`${styles.tabBtn} ${layoutView === 2 ? styles.tabActive : ''}`}
          onClick={() => setLayoutView(2)}
        >
          Todas 2 (Tarjetas)
        </button>
      </div>

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
            jornada={jornada}
            predictions={predictions}
            actuals={actuals}
            r16Substitutions={r16Substitutions}
            octavosSubstitutions={octavosSubstitutions}
            cuartosSubstitutions={cuartosSubstitutions}
            semifinalSubstitutions={semifinalSubstitutions}
            tercerPuestoSubstitutions={tercerPuestoSubstitutions}
            finalSubstitutions={finalSubstitutions}
          />
        )}
      </div>
    </div>
  )
}
