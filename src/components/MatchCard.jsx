import { TEAMS } from '../data/teams'
import { GROUP_COLORS } from '../data/groupColors'
import { useIsMobile } from '../hooks/useIsMobile'
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
  r16Substitutions = {},
  selectedThirds = {},
  availableThirds = {},
  onSelectThird = null,
  isAdmin = false,
  groupsCompleted = false,
  onSetWinner = null,
  onSetPredictedWinner = null,
}) {
  const isMobile = useIsMobile()

  // Detectar si es eliminatoria
  const isElimination = match.ph !== 'G'
  const resultH = value?.h ?? actual?.h
  const resultA = value?.a ?? actual?.a
  const hasResult = resultH !== undefined && resultA !== undefined && resultH !== '' && resultA !== ''
  const isDraw = hasResult && resultH === resultA
  const autoWinner = hasResult && !isDraw ? (resultH > resultA ? 'h' : 'a') : null
  const userHasPrediction = value?.h !== undefined && value?.h !== '' && value?.a !== undefined && value?.a !== ''
  const adminHasActual = actual?.h !== undefined && actual?.h !== '' && actual?.a !== undefined && actual?.a !== ''
  const showWinnerSelector = isElimination && isDraw && (editable || (isAdmin && actual))
  const showWinnerDisplay = isElimination && (userHasPrediction || adminHasActual)

  // Resolver nombres de equipos, con substituciones para dieciseisavos
  const resolveTeamCode = (code) => {
    const substituted = r16Substitutions[code] || code
    return TEAMS[substituted]
  }

  const getTeamDisplay = (code, teamObj, isMobile) => {
    // Si es una referencia de dieciseisavos sin substitución, mostrar código
    if (code.includes('.º') && !teamObj) {
      return code
    }
    // Si es mobile, mostrar código de equipo
    if (isMobile && teamObj) {
      return teamObj.c || code
    }
    // Si no es mobile, mostrar nombre completo
    return teamObj?.n || code
  }

  // Detectar y extraer referencias a terceros
  const isThirdPlaceRef = (code) => code && code.includes('3.º')
  const extractThirdGroupOptions = (code) => {
    if (!code || !code.includes('3.º')) return []
    const match = code.match(/3\.º\s*(.+)/i)
    if (!match) return []
    return match[1].split('/').map(g => g.trim())
  }

  const homeOptions = extractThirdGroupOptions(match.h)
  const awayOptions = extractThirdGroupOptions(match.a)

  // Resolver equipos, considerando terceros seleccionados
  let h, a
  if (homeOptions.length > 0) {
    // Es una referencia a terceros
    const selectedGroupForMatch = selectedThirds[match.id]
    if (selectedGroupForMatch && homeOptions.includes(selectedGroupForMatch)) {
      const teamCode = availableThirds[selectedGroupForMatch]
      h = teamCode ? TEAMS[teamCode] : null
    }
  } else {
    h = resolveTeamCode(match.h)
  }

  if (awayOptions.length > 0) {
    // Es una referencia a terceros
    const selectedGroupForMatch = selectedThirds[match.id]
    if (selectedGroupForMatch && awayOptions.includes(selectedGroupForMatch)) {
      const teamCode = availableThirds[selectedGroupForMatch]
      a = teamCode ? TEAMS[teamCode] : null
    }
  } else {
    a = resolveTeamCode(match.a)
  }

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

  // Si se selecciona un tercero, mostrar "3º [GRUPO]"
  const selectedThirdGroup = selectedThirds[match.id]
  const homeDisplay = (homeOptions.length > 0 && selectedThirdGroup)
    ? { position: '3', group: selectedThirdGroup }
    : (homeGroupInfo || { position: '-', group: '-' })
  const awayDisplay = (awayOptions.length > 0 && selectedThirdGroup)
    ? { position: '3', group: selectedThirdGroup }
    : (awayGroupInfo || { position: '-', group: '-' })

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
          {homeOptions.length > 0 && isAdmin && !h ? (
            <select
              className={styles.thirdSelector}
              onChange={(e) => {
                const group = e.target.value
                if (onSelectThird) onSelectThird(match.id, group)
              }}
              defaultValue={selectedThirds[match.id] || ''}
            >
              <option value="">Seleccionar 3º...</option>
              {homeOptions.map(group => {
                const thirdTeam = availableThirds[group]
                const isUsedInOtherMatch = Object.entries(selectedThirds).some(([mId, g]) => g === group && mId !== match.id)
                return (
                  <option key={group} value={group} disabled={isUsedInOtherMatch}>
                    {group}º - {thirdTeam ? TEAMS[thirdTeam]?.n : 'N/A'} {isUsedInOtherMatch ? '(usado)' : ''}
                  </option>
                )
              })}
            </select>
          ) : (
            <>
              <span className={styles.name}>{getTeamDisplay(match.h, h, isMobile)}</span>
              {showWinnerDisplay && (
                <span
                  onClick={() => {
                    if (!isAdmin && onSetPredictedWinner && isDraw) onSetPredictedWinner(match.id, 'h')
                    else if (isAdmin && onSetWinner && isDraw) onSetWinner(match.id, 'h')
                  }}
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '2px solid #00d9ff',
                    marginLeft: '0.5rem',
                    background: (autoWinner === 'h' || (!showActual ? actual : value)?.winner === 'h') ? '#00d9ff' : 'transparent',
                    cursor: isDraw ? 'pointer' : 'default',
                  }}
                />
              )}
            </>
          )}
        </div>

        <div className={styles.score}>
            {editable && !isConfirmed ? (
              <>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                </div>
              </>
            ) : (
              <>
                {(value?.h !== undefined && value?.h !== '') || actual?.h !== undefined ? (
                  <>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={styles.gol}>{value?.h ?? actual?.h}</span>
                      <span>-</span>
                      <span className={styles.gol}>{value?.a ?? actual?.a}</span>
                      {resetBtn && !isConfirmed && (
                        <button onClick={resetBtn} className={styles.resetBtn} title="Borrar resultado">
                          ↺
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <span className={styles.noResult}>- -</span>
                )}
              </>
            )}
        </div>

        <div className={styles.team}>
          {awayOptions.length > 0 && isAdmin && !selectedThirds[match.id] ? (
            <select
              className={styles.thirdSelector}
              onChange={(e) => {
                const group = e.target.value
                if (onSelectThird) onSelectThird(match.id, group)
              }}
              value={''}
              disabled={!groupsCompleted}
              title={!groupsCompleted ? 'Completa la jornada 3 para seleccionar terceros' : ''}
            >
              <option value="">Seleccionar 3º...</option>
              {awayOptions.map(group => {
                const thirdTeam = availableThirds[group]
                const isUsedInOtherMatch = Object.entries(selectedThirds).some(([mId, g]) => g === group && mId !== match.id)
                return (
                  <option key={group} value={group} disabled={isUsedInOtherMatch}>
                    {group}º - {thirdTeam ? TEAMS[thirdTeam]?.n : 'N/A'} {isUsedInOtherMatch ? '(usado)' : ''}
                  </option>
                )
              })}
            </select>
          ) : (
            <>
              {showWinnerDisplay && (
                <span
                  onClick={() => {
                    if (!isAdmin && onSetPredictedWinner && isDraw) onSetPredictedWinner(match.id, 'a')
                    else if (isAdmin && onSetWinner && isDraw) onSetWinner(match.id, 'a')
                  }}
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '2px solid #00d9ff',
                    marginRight: '0.5rem',
                    background: (autoWinner === 'a' || (!showActual ? actual : value)?.winner === 'a') ? '#00d9ff' : 'transparent',
                    cursor: isDraw ? 'pointer' : 'default',
                  }}
                />
              )}
              <span className={styles.name}>{getTeamDisplay(match.a, a, isMobile)}</span>
              <span className={styles.flag}>{a?.f}</span>
            </>
          )}
        </div>
      </div>

      {showActual && actual && (
        <div className={styles.actualResult}>
          Resultado real: <span className={styles.actualValue}>{actual.h}-{actual.a}</span>
          {actual.winner && (
            <>
              {' - Ganador: '}<span className={styles.actualValue}>{actual.winner === 'h' ? getTeamDisplay(match.h, h, isMobile) : getTeamDisplay(match.a, a, isMobile)}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
