import { TEAMS } from '../data/teams'
import { GROUP_COLORS } from '../data/groupColors'
import styles from '../styles/MatchCard.module.css'

export default function MatchCard({
  match,
  value,
  onChange,
  onReset,
  actual,
  showActual,
  readOnly,
  editable,
  saveBtn,
  resetBtn,
  isConfirmed = false,
}) {
  const h = TEAMS[match.h]
  const a = TEAMS[match.a]

  // Extraer grupo/clasificación en eliminatorias (ej: "1.º A" → "1º A")
  const extractGroupInfo = (teamStr) => {
    if (!teamStr) return null

    // Si contiene "/" (múltiples opciones), mostrar con asterisco
    if (teamStr.includes('/')) {
      const match = teamStr.match(/^(\d+)/)
      if (match) {
        return {
          position: match[1],
          group: '*',
        }
      }
    }

    // Si es un grupo específico
    const match = teamStr.match(/^(\d+)\D+(\w)$/)
    if (match) {
      return {
        position: match[1],
        group: match[2],
      }
    }
    return null
  }

  const homeGroupInfo = extractGroupInfo(match.h)
  const awayGroupInfo = extractGroupInfo(match.a)
  const isElimination = match.ph !== 'G'

  // Mostrar placeholders si no hay info de grupo válida
  const homeDisplay = homeGroupInfo || { position: '-', group: '-' }
  const awayDisplay = awayGroupInfo || { position: '-', group: '-' }

  return (
    <div className={styles.matchCard}>
      <div className={styles.matchHeader}>
        {isElimination ? (
          <div className={styles.groupBadgesContainer}>
            <div
              className={styles.groupBadgeSmall}
              style={{
                background: (homeDisplay.group === '*' || homeDisplay.group === '-') ? 'rgba(255, 255, 255, 0.1)' : GROUP_COLORS[homeDisplay.group]?.bg,
                borderColor: (homeDisplay.group === '*' || homeDisplay.group === '-') ? 'rgba(255, 255, 255, 0.2)' : GROUP_COLORS[homeDisplay.group]?.border,
                color: (homeDisplay.group === '*' || homeDisplay.group === '-') ? '#94a3b8' : GROUP_COLORS[homeDisplay.group]?.text,
              }}
            >
              {homeDisplay.position === '-' ? '-' : `${homeDisplay.position}º ${homeDisplay.group}`}
            </div>
            <div
              className={styles.groupBadgeSmall}
              style={{
                background: (awayDisplay.group === '*' || awayDisplay.group === '-') ? 'rgba(255, 255, 255, 0.1)' : GROUP_COLORS[awayDisplay.group]?.bg,
                borderColor: (awayDisplay.group === '*' || awayDisplay.group === '-') ? 'rgba(255, 255, 255, 0.2)' : GROUP_COLORS[awayDisplay.group]?.border,
                color: (awayDisplay.group === '*' || awayDisplay.group === '-') ? '#94a3b8' : GROUP_COLORS[awayDisplay.group]?.text,
              }}
            >
              {awayDisplay.position === '-' ? '-' : `${awayDisplay.position}º ${awayDisplay.group}`}
            </div>
          </div>
        ) : (
          <div
            className={styles.groupBadge}
            style={{
              background: GROUP_COLORS[match.gr]?.bg,
              borderColor: GROUP_COLORS[match.gr]?.border,
              color: GROUP_COLORS[match.gr]?.text,
            }}
          >
            {match.gr}
          </div>
        )}
        <div className={styles.rightSection}>
          <div className={styles.dateTime}>
            <span className={styles.date}>{match.dt}</span>
            <span className={styles.time}>{match.tm}</span>
          </div>
          <div className={styles.matchId}>
            P{match.id}
          </div>
        </div>
      </div>

      <div className={styles.matchBody}>
        <div className={styles.team}>
          <span className={styles.flag}>{h?.f}</span>
          <span className={styles.name}>{h?.n}</span>
        </div>

        <div className={styles.score}>
          {editable && !isConfirmed ? (
            <>
              <input
                type="text"
                inputMode="numeric"
                placeholder="-"
                maxLength="2"
                value={value?.h === '' || value?.h === undefined ? '' : value?.h}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '')
                  onChange('h', val)
                }}
                style={{
                  borderColor: value?.h === '' || value?.h === undefined ? '#ff0000' : '#00d9ff',
                  borderWidth: value?.h === '' || value?.h === undefined ? '2px' : '1px',
                  backgroundColor: value?.h === '' || value?.h === undefined ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 217, 255, 0.1)',
                  boxShadow: value?.h === '' || value?.h === undefined ? '0 0 8px rgba(255, 0, 0, 0.3)' : 'none',
                }}
                className={styles.input}
              />
              <span>-</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="-"
                maxLength="2"
                value={value?.a === '' || value?.a === undefined ? '' : value?.a}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '')
                  onChange('a', val)
                }}
                style={{
                  borderColor: value?.a === '' || value?.a === undefined ? '#ff0000' : '#00d9ff',
                  borderWidth: value?.a === '' || value?.a === undefined ? '2px' : '1px',
                  backgroundColor: value?.a === '' || value?.a === undefined ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 217, 255, 0.1)',
                  boxShadow: value?.a === '' || value?.a === undefined ? '0 0 8px rgba(255, 0, 0, 0.3)' : 'none',
                }}
                className={styles.input}
              />
              {saveBtn && (
                <button onClick={saveBtn} className={styles.saveBtn}>
                  ✓
                </button>
              )}
            </>
          ) : (
            <>
              {(value?.h !== undefined && value?.h !== '') || actual?.h !== undefined ? (
                <>
                  <span className={styles.gol}>{value?.h ?? actual?.h}</span>
                  <span>-</span>
                  <span className={styles.gol}>{value?.a ?? actual?.a}</span>
                </>
              ) : (
                <span className={styles.noResult}>- -</span>
              )}
              {resetBtn && !isConfirmed && (
                <button onClick={resetBtn} className={styles.resetBtn} title="Borrar resultado">
                  ↺
                </button>
              )}
            </>
          )}
        </div>

        <div className={styles.team}>
          <span className={styles.name}>{a?.n}</span>
          <span className={styles.flag}>{a?.f}</span>
        </div>
      </div>

      {showActual && actual && (
        <div className={styles.actualResult}>
          Resultado real: {actual.h}-{actual.a}
        </div>
      )}
    </div>
  )
}
