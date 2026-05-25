import { useMemo } from 'react'
import { calcTotalPts } from '../utils/scoring'
import { MATCHES } from '../data/matches'
import { TEAMS } from '../data/teams'
import { AVATAR_COLORS } from '../data/colors'
import { generateInitials } from '../utils/initials'
import styles from '../styles/Clasificacion.module.css'

export default function Clasificacion({ participants, predictions, actuals }) {
  const initialsMap = useMemo(() => generateInitials(participants), [participants])
  const colorMap = useMemo(() => {
    const map = {}
    participants.forEach((p, i) => {
      map[p] = AVATAR_COLORS[i % AVATAR_COLORS.length]
    })
    return map
  }, [participants])

  // Obtener el campeón real y quién lo acertó
  const getChampionInfo = () => {
    const finalMatch = actuals[104]
    if (!finalMatch || finalMatch.h === undefined || finalMatch.a === undefined) return null

    const hScore = Number(finalMatch.h)
    const aScore = Number(finalMatch.a)
    const winner = finalMatch.winner || (hScore > aScore ? 'h' : aScore > hScore ? 'a' : null)
    if (!winner) return null

    const finalMatchData = MATCHES.find(m => m.id === 104)
    if (!finalMatchData) return null

    const teamCode = winner === 'h' ? finalMatchData.h : finalMatchData.a
    const championTeam = TEAMS[teamCode]?.n || teamCode

    // Encontrar quién acertó el campeón
    const winners = participants.filter(p => {
      const pred = predictions[p]?.predictions[104]
      if (!pred || pred.h === undefined || pred.a === undefined) return false
      const hScore = Number(pred.h)
      const aScore = Number(pred.a)
      const predWinner = pred.winner || (hScore > aScore ? 'h' : aScore > hScore ? 'a' : null)
      if (!predWinner) return false
      const predTeamCode = predWinner === 'h' ? finalMatchData.h : finalMatchData.a
      return predTeamCode === teamCode
    })

    return { championTeam, winners }
  }

  // Obtener el campeón real
  const getRealChampion = () => {
    const finalMatch = actuals[104]
    if (!finalMatch || finalMatch.h === undefined || finalMatch.a === undefined) return null

    const hScore = Number(finalMatch.h)
    const aScore = Number(finalMatch.a)
    const winner = finalMatch.winner || (hScore > aScore ? 'h' : aScore > hScore ? 'a' : null)
    if (!winner) return null

    const finalMatchData = MATCHES.find(m => m.id === 104)
    if (!finalMatchData) return null

    const teamCode = winner === 'h' ? finalMatchData.h : finalMatchData.a
    return TEAMS[teamCode]?.n || teamCode
  }

  const realChampion = getRealChampion()

  const standings = participants.map((p, i) => ({
    name: p,
    pts: calcTotalPts(p, predictions, actuals, MATCHES),
    color: colorMap[p],
  })).sort((a, b) => b.pts - a.pts)

  return (
    <div className={styles.clasificacion}>
      {realChampion && standings.length > 0 && (
        <div className={styles.championSection}>
          <div>
            <div className={styles.championLabel}>Campeón Real:</div>
            <div className={styles.championValue}>{realChampion}</div>
          </div>
          <div className={styles.winnerSection}>
            <div className={styles.winnerLabel}>Ganador:</div>
            <div className={styles.winner}>{standings[0].name}</div>
          </div>
        </div>
      )}

      <div className={styles.table}>
        <div className={styles.header}>
          <div className={styles.pos}>Pos</div>
          <div className={styles.name}>Participante</div>
          <div className={styles.pts}>Puntos</div>
        </div>

        <div className={styles.rows}>
          {standings.map((p, i) => {
            let rowClass = styles.row
            if (i === 0) rowClass += ` ${styles.rowFirst}`
            else if (i === 1) rowClass += ` ${styles.rowSecond}`
            else if (i === 2) rowClass += ` ${styles.rowThird}`
            return (
            <div key={p.name} className={rowClass}>
              <div className={styles.pos}>{i + 1}º</div>
              <div className={styles.nameSection}>
                <div
                  className={styles.avatar}
                  style={{ background: p.color.b, color: p.color.t }}
                >
                  {initialsMap[p.name]}
                </div>
                <span className={styles.nameText}>{p.name}</span>
              </div>
              <div className={styles.pts}>{p.pts}</div>
            </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
