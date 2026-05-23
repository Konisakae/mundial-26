import { MATCHES } from '../data/matches'

// Calcula puntos de un equipo en un grupo basándose en resultados
// Victoria: 3 pts, Empate: 1 pt, Derrota: 0 pts
function calcTeamPoints(teamCode, group, actuals) {
  let points = 0, goalsFor = 0, goalsAgainst = 0
  const groupMatches = MATCHES.filter(m => m.ph === 'G' && m.gr === group)

  groupMatches.forEach(match => {
    if (!actuals[match.id]) return
    const { h, a } = actuals[match.id]

    if (match.h === teamCode) {
      goalsFor += h
      goalsAgainst += a
      if (h > a) points += 3
      else if (h === a) points += 1
    } else if (match.a === teamCode) {
      goalsFor += a
      goalsAgainst += h
      if (a > h) points += 3
      else if (a === h) points += 1
    }
  })

  return { points, goalsFor, goalsAgainst, diff: goalsFor - goalsAgainst }
}

// Calcula ganadores de un grupo (1º y 2º)
// Ordena por: puntos > diferencia de goles > goles a favor
function getGroupWinners(group, actuals) {
  const groupMatches = MATCHES.filter(m => m.ph === 'G' && m.gr === group)
  const teams = new Set()

  groupMatches.forEach(m => {
    teams.add(m.h)
    teams.add(m.a)
  })

  const standings = Array.from(teams)
    .map(t => ({ team: t, ...calcTeamPoints(t, group, actuals) }))
    .sort((a, b) =>
      b.points - a.points ||
      b.diff - a.diff ||
      b.goalsFor - a.goalsFor
    )

  return { first: standings[0]?.team, second: standings[1]?.team }
}

// Retorna objeto con ganadores de todos los grupos
export function getAllGroupWinners(actuals) {
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
  const winners = {}

  groups.forEach(g => {
    winners[g] = getGroupWinners(g, actuals)
  })

  return winners
}

// Retorna tabla de standings de un grupo para mostrar
export function getGroupStandings(group, actuals) {
  const groupMatches = MATCHES.filter(m => m.ph === 'G' && m.gr === group)
  const teams = new Set()

  groupMatches.forEach(m => {
    teams.add(m.h)
    teams.add(m.a)
  })

  const standings = Array.from(teams)
    .map(t => ({
      team: t,
      ...calcTeamPoints(t, group, actuals)
    }))
    .sort((a, b) =>
      b.points - a.points ||
      b.diff - a.diff ||
      b.goalsFor - a.goalsFor
    )

  return standings
}
