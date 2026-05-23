import { TEAMS } from '../data/teams'
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
}) {
  const h = TEAMS[match.h]
  const a = TEAMS[match.a]

  return (
    <div className={styles.matchCard}>
      <div className={styles.matchHeader}>
        <div className={styles.groupBadge}>{match.gr}</div>
        <div className={styles.dateTime}>
          <span className={styles.date}>{match.dt}</span>
          <span className={styles.time}>{match.tm}</span>
        </div>
      </div>

      <div className={styles.matchBody}>
        <div className={styles.team}>
          <span className={styles.flag}>{h?.f}</span>
          <span className={styles.name}>{h?.n}</span>
        </div>

        <div className={styles.score}>
          {editable ? (
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
              {resetBtn && (
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
