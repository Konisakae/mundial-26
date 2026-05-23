import { useState } from 'react'
import { TEAMS } from '../data/teams'
import { AVATAR_COLORS } from '../data/colors'
import { generateInitials } from '../utils/initials'
import { getTop12Thirds } from '../utils/groupStandings'
import styles from '../styles/ThirdPlaceSelector.module.css'

export default function ThirdPlaceSelector({ actuals, onConfirm }) {
  const [selected, setSelected] = useState({})
  const thirds = getTop12Thirds(actuals)
  const initialsMap = generateInitials(thirds.map(t => t.team))

  const handleSelect = (group) => {
    const newSelected = { ...selected }
    if (newSelected[group]) {
      delete newSelected[group]
    } else {
      newSelected[group] = true
    }
    setSelected(newSelected)
  }

  const handleConfirm = () => {
    const selectedGroups = Object.keys(selected)
    if (selectedGroups.length !== 8) return

    // Crear mapeo de grupo → equipo
    const selectedMap = {}
    selectedGroups.forEach(g => {
      const third = thirds.find(t => t.group === g)
      selectedMap[g] = third.team
    })

    onConfirm(selectedMap)
  }

  const selectedCount = Object.keys(selected).length
  const canConfirm = selectedCount === 8

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Seleccionar 8 Terceros Lugares</h3>
        <p>Selecciona exactamente 8 terceros que avanzan a Dieciseisavos</p>
        <div className={styles.counter}>
          Seleccionados: {selectedCount}/8
        </div>
      </div>

      <div className={styles.table}>
        <div className={styles.row + ' ' + styles.headerRow}>
          <div className={styles.checkbox}></div>
          <div className={styles.pos}>Pos</div>
          <div className={styles.group}>Grupo</div>
          <div className={styles.team}>Equipo</div>
          <div className={styles.pts}>Pts</div>
          <div className={styles.dif}>Dif</div>
          <div className={styles.gf}>GF</div>
        </div>

        {thirds.map((third, idx) => {
          const team = TEAMS[third.team]
          const isSelected = selected[third.group]
          const color = AVATAR_COLORS[idx % AVATAR_COLORS.length]

          return (
            <div
              key={third.group}
              className={styles.row + (isSelected ? ' ' + styles.selected : '')}
              onClick={() => handleSelect(third.group)}
            >
              <div className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <div className={styles.pos}>{idx + 1}º</div>
              <div className={styles.group}>
                <span className={styles.badge}>{third.group}</span>
              </div>
              <div className={styles.team}>
                <div className={styles.teamInfo}>
                  <span className={styles.flag}>{team?.f}</span>
                  <span className={styles.code}>{team?.c}</span>
                </div>
              </div>
              <div className={styles.pts}>{third.points}</div>
              <div className={styles.dif}>{third.diff > 0 ? '+' : ''}{third.diff}</div>
              <div className={styles.gf}>{third.goalsFor}</div>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={styles.confirmBtn}
        >
          ✓ Generar Dieciseisavos
        </button>
      </div>
    </div>
  )
}
