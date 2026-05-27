import { useState, useMemo } from 'react'
import { AVATAR_COLORS } from '../data/colors'
import { generateInitials } from '../utils/initials'
import { ADMIN_PIN } from '../config'
import styles from '../styles/Header.module.css'

export default function Header({
  participants, participant, setParticipant,
  addParticipant, totalPts,
  isAdmin, setIsAdmin,
  tab, setTab,
  simulate,
  simulate16,
  simulateOctavos,
  simulateCuartos,
  simulateSemis,
  simulateThirdPlace,
  simulateFinal,
  simulatedJornadas,
  simulatedPhases,
  selectedThirds,
  clearAllData,
}) {
  const [newName, setNewName] = useState('')
  const [pinVal, setPinVal] = useState('')
  const [showPin, setShowPin] = useState(false)
  const initialsMap = useMemo(() => generateInitials(participants), [participants])

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    addParticipant(name)
    setNewName('')
  }

  const handlePin = () => {
    if (pinVal === ADMIN_PIN) setIsAdmin(true)
    setShowPin(false)
    setPinVal('')
  }

  const pIdx = participant ? participants.indexOf(participant) : -1
  const pAv = pIdx >= 0 ? AVATAR_COLORS[pIdx % AVATAR_COLORS.length] : null

  return (
    <div className={styles.header}>
      <div className={styles.container}>
        {/* Top row */}
        <div className={styles.topRow}>
          <div className={styles.title}>
            <div className={styles.logo}>🏆</div>
            <div className={styles.titleText}>MUNDIAL 2026</div>
          </div>

          <div className={styles.rightControls}>
            {participant && pAv && (
              <div className={styles.scoreBox} style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className={styles.avatarSmall} style={{ background: pAv.b, color: pAv.t }}>
                  {initialsMap[participant]}
                </div>
                <span className={styles.scoreText}>{totalPts} pts</span>
              </div>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => simulate(1)}
                  className={styles.simulateBtn}
                  title="Simular jornada 1: 24 partidos (1-24)"
                >
                  SJ1 {simulatedJornadas[1] ? '✓' : ''}
                </button>

                <button
                  onClick={() => simulate(2)}
                  disabled={!simulatedJornadas[1]}
                  className={styles.simulateBtn}
                  title="Simular jornada 2: 24 partidos (25-48)"
                  style={{ opacity: simulatedJornadas[1] ? 1 : 0.5 }}
                >
                  SJ2 {simulatedJornadas[2] ? '✓' : simulatedJornadas[1] ? '' : '🔒'}
                </button>

                <button
                  onClick={() => simulate(3)}
                  disabled={!simulatedJornadas[1] || !simulatedJornadas[2]}
                  className={styles.simulateBtn}
                  title="Simular jornada 3: 24 partidos (49-72)"
                  style={{ opacity: simulatedJornadas[1] && simulatedJornadas[2] ? 1 : 0.5 }}
                >
                  SJ3 {simulatedJornadas[3] ? '✓' : simulatedJornadas[1] && simulatedJornadas[2] ? '' : '🔒'}
                </button>

                <button
                  onClick={simulate16}
                  disabled={!simulatedJornadas[1] || !simulatedJornadas[2] || !simulatedJornadas[3] || Object.keys(selectedThirds).length < 8}
                  className={styles.simulateBtn}
                  title="Simular dieciseisavos: 16 partidos (73-88)"
                  style={{ opacity: (simulatedJornadas[1] && simulatedJornadas[2] && simulatedJornadas[3] && Object.keys(selectedThirds).length >= 8) ? 1 : 0.5 }}
                >
                  S16 {Object.keys(selectedThirds).length >= 8 ? '✓' : ''}
                </button>

                <button
                  onClick={simulateOctavos}
                  disabled={Object.keys(selectedThirds).length < 8}
                  className={styles.simulateBtn}
                  title="Simular octavos: 8 partidos (89-96)"
                  style={{ opacity: (Object.keys(selectedThirds).length >= 8) ? 1 : 0.5 }}
                >
                  S8 {simulatedPhases?.OCT ? '✓' : Object.keys(selectedThirds).length >= 8 ? '' : '🔒'}
                </button>

                <button
                  onClick={simulateCuartos}
                  disabled={!simulatedPhases?.OCT}
                  className={styles.simulateBtn}
                  title="Simular cuartos: 4 partidos (97-100)"
                  style={{ opacity: simulatedPhases?.OCT ? 1 : 0.5 }}
                >
                  S4 {simulatedPhases?.CTO ? '✓' : simulatedPhases?.OCT ? '' : '🔒'}
                </button>

                <button
                  onClick={simulateSemis}
                  disabled={!simulatedPhases?.CTO}
                  className={styles.simulateBtn}
                  title="Simular semifinales: 2 partidos (101-102)"
                  style={{ opacity: simulatedPhases?.CTO ? 1 : 0.5 }}
                >
                  S2 {simulatedPhases?.SEMI ? '✓' : simulatedPhases?.CTO ? '' : '🔒'}
                </button>

                <button
                  onClick={simulateThirdPlace}
                  disabled={!simulatedPhases?.SEMI}
                  className={styles.simulateBtn}
                  title="Simular tercer puesto: 1 partido (103)"
                  style={{ opacity: simulatedPhases?.SEMI ? 1 : 0.5 }}
                >
                  S3P {simulatedPhases?.['3P'] ? '✓' : simulatedPhases?.SEMI ? '' : '🔒'}
                </button>

                <button
                  onClick={simulateFinal}
                  disabled={!simulatedPhases?.SEMI}
                  className={styles.simulateBtn}
                  title="Simular final: 1 partido (104)"
                  style={{ opacity: simulatedPhases?.SEMI ? 1 : 0.5 }}
                >
                  SF {simulatedPhases?.FIN ? '✓' : simulatedPhases?.SEMI ? '' : '🔒'}
                </button>

                <button
                  onClick={clearAllData}
                  className={styles.clearBtn}
                  title="Borrar toda la simulación"
                >
                  🗑️
                </button>
              </>
            )}

            {!showPin ? (
              <>
                <button
                  onClick={() => isAdmin ? setIsAdmin(false) : setShowPin(true)}
                  className={`${styles.adminBtn} ${isAdmin ? styles.adminActive : ''}`}
                >
                  {isAdmin ? '⚙️ Admin ON' : '⚙️'}
                </button>
                {isAdmin && (
                  <select
                    value={participant || ''}
                    onChange={e => setParticipant(e.target.value)}
                    className={styles.adminSelect}
                  >
                    <option value="">Participante...</option>
                    {participants.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                )}
              </>
            ) : (
              <div className={styles.pinInput}>
                <input
                  type="password"
                  placeholder="PIN"
                  value={pinVal}
                  onChange={e => setPinVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePin()}
                  className={styles.pinField}
                />
                <button onClick={handlePin} className={styles.pinBtn}>✓</button>
              </div>
            )}
          </div>
        </div>

        {/* Participant chips - only visible in admin mode */}
        {isAdmin && (
          <div className={styles.participants}>
            {participants.map((p, i) => {
              const av = AVATAR_COLORS[i % AVATAR_COLORS.length]
              const active = p === participant
              return (
                <button
                  key={p}
                  onClick={() => setParticipant(active ? '' : p)}
                  className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                  style={active ? { borderColor: av.t, backgroundColor: av.b } : {}}
                >
                  <div
                    className={styles.avatarChip}
                    style={{
                      background: active ? av.t : av.b,
                      color: active ? av.b : av.t,
                    }}
                  >
                    {initialsMap[p]}
                  </div>
                  <span>{p}</span>
                </button>
              )
            })}
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="+ Añadir"
              className={styles.addInput}
            />
          </div>
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          <div className={styles.tabGroup}>
            {[
              ['resultados', '📊 RESULTADOS'],
              ['grupos', '🏆 GRUPOS'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setTab('apuestas')}
            className={`${styles.tab} ${tab === 'apuestas' ? styles.tabActive : ''}`}
          >
            📝 TUS APUESTAS
          </button>
          <div className={styles.tabGroup}>
            {[
              ['clasificacion', '🏅 CLASIFICACIÓN'],
              ['todas', '📈 ESTADÍSTICAS'],
              ['evolucion', '📈 EVOLUCIÓN'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
