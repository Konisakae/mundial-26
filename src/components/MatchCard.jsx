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
        <span className={styles.date}>{match.dt}</span>
        <span className={styles.time}>{match.tm}</span>
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
                type="number"
                min="0"
                max="20"
                placeholder="-"
                value={value?.h === '' || value?.h === undefined ? '' : value?.h}
                onChange={e => {
                  const newVal = e.target.value
                  if ((!value?.h || value?.h === '') && newVal === '1') {
                    onChange('h', '0')
                  } else {
                    onChange('h', newVal || '0')
                  }
                }}
                onFocus={e => {
                  if (!value?.h && value?.h !== 0) {
                    onChange('h', '0')
                  }
                }}
                className={styles.input}
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                max="20"
                placeholder="-"
                value={value?.a === '' || value?.a === undefined ? '' : value?.a}
                onChange={e => {
                  const newVal = e.target.value
                  if ((!value?.a || value?.a === '') && newVal === '1') {
                    onChange('a', '0')
                  } else {
                    onChange('a', newVal || '0')
                  }
                }}
                onFocus={e => {
                  if (!value?.a && value?.a !== 0) {
                    onChange('a', '0')
                  }
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
