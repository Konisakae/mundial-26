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

            <button
              onClick={() => simulate(1)}
              className={styles.simulateBtn}
              title="Simular primeros 24 partidos (3 jornadas)"
            >
              🎯 Simular 1
            </button>

            <button
              onClick={() => simulate(2)}
              className={styles.simulateBtn}
              title="Simular fase de grupos completa (72 partidos)"
            >
              🎯 Simular 2
            </button>

            {!showPin ? (
              <button
                onClick={() => isAdmin ? setIsAdmin(false) : setShowPin(true)}
                className={`${styles.adminBtn} ${isAdmin ? styles.adminActive : ''}`}
              >
                {isAdmin ? '⚙️ Admin ON' : '⚙️'}
              </button>
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

        {/* Participant chips */}
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

        {/* Tabs */}
        <div className={styles.tabs}>
          {[
            ['resultados', '📊 RESULTADOS'],
            ['grupos', '🏆 GRUPOS'],
            ['apuestas', '📝 TUS APUESTAS'],
            ['todas', '👥 TODAS LAS APUESTAS'],
            ['clasificacion', '🏅 CLASIFICACIÓN'],
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
  )
}
