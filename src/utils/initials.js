export function generateInitials(participants) {
  const initials = {}

  // Primera pasada: generar iniciales de 2 letras
  for (const p of participants) {
    let initial = (p[0] + (p[1] || '')).toUpperCase()
    initial = initial[0] + initial[1]?.toLowerCase()
    initials[p] = initial
  }

  // Segunda pasada: detectar conflictos
  const conflicts = {}
  Object.entries(initials).forEach(([name, initial]) => {
    if (!conflicts[initial]) conflicts[initial] = []
    conflicts[initial].push(name)
  })

  // Tercera pasada: resolver conflictos usando tercera letra para duplicados posteriores
  Object.entries(conflicts).forEach(([initial, names]) => {
    if (names.length > 1) {
      // Mantener el primero con las 2 letras, cambiar los duplicados a 1ª + 3ª letra
      for (let i = 1; i < names.length; i++) {
        const name = names[i]
        let newInitial = (name[0] + name[2]).toUpperCase()
        newInitial = newInitial[0] + newInitial[1]?.toLowerCase()
        initials[name] = newInitial
      }
    }
  })

  return initials
}
