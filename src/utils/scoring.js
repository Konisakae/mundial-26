// Devuelve '1', 'X' o '2' dado un marcador. Vacío si no hay datos.
export const getRes = (h, a) => {
  const n = Number(h), m = Number(a)
  if (h === '' || a === '' || isNaN(n) || isNaN(m)) return ''
  return n > m ? '1' : n < m ? '2' : 'X'
}

// Calcula puntos de una predicción frente al resultado real.
// Para grupos: Gol correcto +1, 1/X/2 correcto +2, exacto +5
// Para eliminatorias: igual pero +2 extra si aciertas ganador
export const calcPts = (pred, actual, match = null) => {
  if (!pred) return null
  if (actual?.h === undefined || actual?.a === undefined) return null
  if (actual.h === '' || actual.a === '') return null
  if (pred.h === undefined || pred.a === undefined) return null
  if (pred.h === '' || pred.a === '') return null

  const g1 = Number(pred.h) === Number(actual.h) ? 1 : 0
  const g2 = Number(pred.a) === Number(actual.a) ? 1 : 0
  const res = getRes(pred.h, pred.a) === getRes(actual.h, actual.a) ? 2 : 0
  let total = g1 + g2 + res

  // Si es eliminatoria con empate
  if (match && match.ph !== 'G') {
    const predRes = getRes(pred.h, pred.a)
    const actualRes = getRes(actual.h, actual.a)
    const isDraw = predRes === 'X' && actualRes === 'X'

    if (isDraw) {
      // En empate: marcador exacto vale 4 en lugar de 5 (el 5 es si también aciertas ganador)
      if (total === 4) total = 4
      // Si aciertas el ganador: +2
      if (actual.winner && pred.winner && pred.winner === actual.winner) total += 2
    } else if (actualRes !== '') {
      // Si no es empate pero aciertas ganador: +2
      if (actual.winner && pred.winner && pred.winner === actual.winner) total += 2
    }
  }

  // Para marcador exacto en grupos (o en eliminatorias no empate): bonus
  if (!match || match.ph === 'G') {
    return total === 4 ? 5 : total
  }
  return total
}

// Iniciales de un nombre (máx. 2 letras)
export const initials = (name) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

// Calcula la clasificación de grupo dado el mapa de resultados actuales
export const calcGroupStandings = (groupMatches, actuals) => {
  const teams = [...new Set(groupMatches.flatMap(m => [m.h, m.a]))]
  const stats = Object.fromEntries(
    teams.map(t => [t, { p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 }])
  )

  groupMatches.forEach(match => {
    const act = actuals[match.id]
    if (!act || act.h === '' || act.a === '') return
    const h = Number(act.h), a = Number(act.a)
    stats[match.h].p++; stats[match.a].p++
    stats[match.h].gf += h; stats[match.h].ga += a
    stats[match.a].gf += a; stats[match.a].ga += h
    if (h > a) { stats[match.h].w++; stats[match.h].pts += 3; stats[match.a].l++ }
    else if (h < a) { stats[match.a].w++; stats[match.a].pts += 3; stats[match.h].l++ }
    else { stats[match.h].d++; stats[match.h].pts++; stats[match.a].d++; stats[match.a].pts++ }
  })

  return Object.entries(stats)
    .map(([code, s]) => ({ code, ...s, gd: s.gf - s.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
}

// Calcula el total de puntos de un participante
export const calcTotalPts = (name, predictions, actuals, matches) =>
  matches.reduce((acc, m) => {
    const pts = calcPts(predictions[name]?.[m.id], actuals[m.id], m)
    return acc + (pts || 0)
  }, 0)
