import { useState, useMemo } from 'react'
import { getAllGroupWinners } from '../utils/groupStandings'
import styles from '../styles/ThirdPlaceSelector.module.css'

export default function ThirdPlaceSelector({ actuals, selectedThirds, onSelectThird, onConfirmThirds }) {
  const groupWinners = useMemo(() => getAllGroupWinners(actuals), [actuals])

  // Obtener los 12 terceros lugares
  const allThirds = useMemo(() => {
    const thirds = []
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
    groups.forEach(group => {
      if (groupWinners[group]?.third) {
        thirds.push({
          group,
          team: groupWinners[group].third,
        })
      }
    })
    return thirds
  }, [groupWinners])

  const selectedCount = useMemo(() => {
    return Object.keys(selectedThirds).filter(k => k !== 'completed').length
  }, [selectedThirds])

  const handleToggle = (group) => {
    if (selectedThirds[group]) {
      // Deseleccionar
      onSelectThird(group, undefined)
    } else {
      // No permitir más de 8
      if (selectedCount >= 8) return
      // Seleccionar
      const team = allThirds.find(t => t.group === group)?.team
      if (team) {
        onSelectThird(group, team)
      }
    }
  }

  const handleConfirm = () => {
    if (selectedCount === 8 && onConfirmThirds) {
      onConfirmThirds()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Selecciona 8 Terceros Lugares</h3>
        <span className={styles.counter}>{selectedCount}/8</span>
      </div>

      <div className={styles.grid}>
        {allThirds.map(({ group, team }) => (
          <div
            key={group}
            className={`${styles.card} ${selectedThirds[group] ? styles.selected : ''}`}
            onClick={() => handleToggle(group)}
          >
            <div className={styles.group}>Grupo {group}</div>
            <div className={styles.team}>{team}</div>
            {selectedThirds[group] && <div className={styles.checkmark}>✓</div>}
          </div>
        ))}
      </div>

      {selectedCount === 8 && (
        <button
          onClick={handleConfirm}
          className={styles.confirmBtn}
        >
          Generar Dieciseisavos
        </button>
      )}

      {selectedCount > 0 && selectedCount < 8 && (
        <p className={styles.hint}>Selecciona {8 - selectedCount} más</p>
      )}
    </div>
  )
}
