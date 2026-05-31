import { useState, useMemo, useRef, useEffect } from 'react'
import { AVATAR_COLORS } from '../data/colors'
import { generateInitials } from '../utils/initials'
import { ADMIN_PIN, PARTICIPANT_CODES } from '../config'
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
  const [selectedParticipantTemp, setSelectedParticipantTemp] = useState('')
  const [participantCodeVal, setParticipantCodeVal] = useState('')
  const [showParticipantCode, setShowParticipantCode] = useState(false)
  const [showParticipantDropdown, setShowParticipantDropdown] = useState(false)
  const [showSimulations, setShowSimulations] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const dropdownRef = useRef(null)
  const initialsMap = useMemo(() => generateInitials(participants), [participants])

  useEffect(() => {
    if (showParticipantDropdown && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      })
    }
  }, [showParticipantDropdown])

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

  const handleParticipantCode = () => {
    if (participantCodeVal === PARTICIPANT_CODES[selectedParticipantTemp]) {
      setParticipant(selectedParticipantTemp)
      setShowParticipantCode(false)
      setSelectedParticipantTemp('')
      setParticipantCodeVal('')
    }
  }

  const pIdx = participant ? participants.indexOf(participant) : -1
  const pAv = pIdx >= 0 ? AVATAR_COLORS[pIdx % AVATAR_COLORS.length] : null

  return (
    <div className={styles.header}>
      <div className={styles.container}>
        {/* Top row with logo and controls */}
        <div className={styles.topRow}>
          <img
            src="/mundial-2026-logo.svg"
            alt="Mundial 2026"
            className={styles.logo}
          />

          {!participant && !selectedParticipantTemp && !showPin && !isAdmin && (
            <div className={styles.mundialTitle}>
              <span className={styles.mundialFull}>MUNDIAL 2026</span>
              <span className={styles.mundialMini}>M26</span>
            </div>
          )}

          {participant && (
            <div className={styles.centerContent}>
              {pAv && (
                <div className={styles.participantInfo}>
                  <div className={styles.avatarCenter} style={{ background: pAv.b, color: pAv.t }}>
                    {initialsMap[participant]}
                  </div>
                  <span className={styles.participantName}>{participant}</span>
                  <span className={styles.scoreText}>{totalPts} pts</span>
                </div>
              )}
              <button
                onClick={() => setTab('apuestas')}
                className={`${styles.topTab} ${tab === 'apuestas' ? styles.topTabActive : ''}`}
              >
                📝 TUS APUESTAS
              </button>
            </div>
          )}

          <div className={styles.rightControls}>
            {isAdmin && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowSimulations(!showSimulations)}
                  className={styles.simulateBtn}
                  title="Menú de simulaciones"
                >
                  ⚙️ SIM
                </button>
                {showSimulations && (
                  <div className={styles.simulationsMenu}>
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
                  </div>
                )}
              </div>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setIsAdmin(false)
                  setParticipant('')
                  setShowSimulations(false)
                  setShowParticipantDropdown(false)
                }}
                className={styles.exitBtn}
                title="Salir de admin"
              >
                ✕
              </button>
            )}

            {!showPin ? (
              <>
                {!participant && !isAdmin && !showParticipantCode && (
                  <div className={styles.participantDropdown}>
                    <button
                      ref={dropdownRef}
                      onClick={() => setShowParticipantDropdown(!showParticipantDropdown)}
                      className={styles.participantDropdownBtn}
                    >
                      {participant ? (
                        <>
                          <div
                            className={styles.avatarSmallBtn}
                            style={{
                              background: AVATAR_COLORS[participants.indexOf(participant) % AVATAR_COLORS.length].b,
                              color: AVATAR_COLORS[participants.indexOf(participant) % AVATAR_COLORS.length].t,
                            }}
                          >
                            {initialsMap[participant]}
                          </div>
                          <span>{participant}</span>
                        </>
                      ) : (
                        'Participante'
                      )}
                      <span className={styles.chevron} style={{transform: showParticipantDropdown ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
                    </button>
                    {showParticipantDropdown && (
                      <div
                        className={styles.participantDropdownMenu}
                        style={{
                          top: `${dropdownPos.top}px`,
                          left: `${dropdownPos.left}px`,
                          width: `${dropdownPos.width}px`
                        }}
                      >
                        {participants.map((p, idx) => {
                          const av = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                          return (
                            <button
                              key={p}
                              onClick={() => {
                                setSelectedParticipantTemp(p)
                                setShowParticipantCode(true)
                                setShowParticipantDropdown(false)
                              }}
                              className={styles.participantDropdownItem}
                            >
                              <div
                                className={styles.avatarDropdownItem}
                                style={{background: av.b, color: av.t}}
                              >
                                {initialsMap[p]}
                              </div>
                              <span>{p}</span>
                            </button>
                          )
                        })}
                        <button
                          onClick={() => {
                            setShowPin(true)
                            setShowParticipantDropdown(false)
                          }}
                          className={`${styles.participantDropdownItem} ${styles.adminDropdownItem}`}
                          style={{borderTop: '1px solid rgba(0, 217, 255, 0.2)'}}
                        >
                          ⚙️ Admin
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {participant && !isAdmin && (
                  <button
                    onClick={() => {
                      setParticipant('')
                      setShowParticipantDropdown(false)
                    }}
                    className={styles.exitBtn}
                    title="Salir del participante"
                  >
                    ✕
                  </button>
                )}
                {!isAdmin && showParticipantCode && (
                  <div className={styles.participantCodeInput}>
                    <input
                      type="password"
                      placeholder="Código"
                      value={participantCodeVal}
                      onChange={e => setParticipantCodeVal(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleParticipantCode()}
                      className={styles.participantCodeField}
                      autoFocus
                    />
                    <button onClick={handleParticipantCode} className={styles.participantCodeBtn}>✓</button>
                    <button onClick={() => {
                      setShowParticipantCode(false)
                      setSelectedParticipantTemp('')
                      setParticipantCodeVal('')
                    }} className={styles.participantCodeBtn} style={{background: 'rgba(255, 100, 100, 0.1)', border: '1px solid rgba(255, 100, 100, 0.3)', color: '#ff6464'}}>✕</button>
                  </div>
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
                <button onClick={() => {
                  setShowPin(false)
                  setPinVal('')
                }} className={styles.pinBtn} style={{background: 'rgba(255, 100, 100, 0.1)', border: '1px solid rgba(255, 100, 100, 0.3)', color: '#ff6464'}}>✕</button>
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
                  <span style={['Lucía', 'Lucas', 'Nic', 'Eva', 'Abuelo'].includes(p) ? { color: '#000' } : {}}>{p}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsRow}>
            <div className={styles.tabGroup}>
              {[
                ['resultados', '📊 RESULTADOS', '📊 RES'],
                ['grupos', '🏆 GRUPOS', '🏆 GR'],
              ].map(([id, label, short]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
                  title={label}
                >
                  <span className={styles.tabLong}>{label}</span>
                  <span className={styles.tabShort}>{short}</span>
                </button>
              ))}
            </div>
            <div className={styles.tabGroup}>
              {[
                ['clasificacion', '🏅 CLASIFICACIÓN', '🏅 CLAS'],
                ['todas', '📈 ESTADÍSTICAS', '📈 EST'],
                ['evolucion', '📈 EVOLUCIÓN', '📈 EVO'],
              ].map(([id, label, short]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
                  title={label}
                >
                  <span className={styles.tabLong}>{label}</span>
                  <span className={styles.tabShort}>{short}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
