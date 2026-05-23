export function generateInitials(participants) {
  const initials = {}
  const used = new Set()

  // Primera pasada: generar iniciales de 2 letras
  for (const p of participants) {
    let initial = (p[0] + (p[1] || '')).toUpperCase()
    initial = initial[0] + initial[1]?.toLowerCase()
    initials[p] = initial
  }

  // Segunda pasada: detectar y resolver conflictos
  const conflicts = {}
  Object.entries(initials).forEach(([name, initial]) => {
    if (!conflicts[initial]) conflicts[initial] = []
    conflicts[initial].push(name)
  })

  // Tercera pasada: usar tercera letra si hay conflicto
  Object.entries(conflicts).forEach(([initial, names]) => {
    if (names.length > 1) {
      names.forEach(name => {
        let newInitial = (name[0] + name[2]).toUpperCase()
        newInitial = newInitial[0] + newInitial[1]?.toLowerCase()
        initials[name] = newInitial
      })
    }
  })

  return initials
}
