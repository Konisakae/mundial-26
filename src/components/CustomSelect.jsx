import { useState, useRef, useEffect } from 'react'
import styles from '../styles/CustomSelect.module.css'

export default function CustomSelect({ value, onChange, options, label }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  const selectedLabel = options.find(opt => opt.value === value)?.label || value

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !buttonRef.current?.contains(e.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className={styles.selectContainer}>
      {label && <label className={styles.label}>{label}</label>}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`${styles.selectButton} ${isOpen ? styles.open : ''}`}
      >
        <span className={styles.selectValue}>{selectedLabel}</span>
        <svg className={styles.selectIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div ref={menuRef} className={styles.selectMenu}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`${styles.selectOption} ${value === opt.value ? styles.selected : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
