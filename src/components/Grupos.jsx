import { MATCHES } from '../data/matches'
import { TEAMS } from '../data/teams'
import { GROUP_COLORS } from '../data/groupColors'
import styles from '../styles/Grupos.module.css'

export default function Grupos({ actuals }) {
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

  const getGroupStandings = (groupId) => {
    const groupMatches = MATCHES.filter(m => m.ph === 'G' && m.gr === groupId)
    const teams = {}

    groupMatches.forEach(match => {
      const h = TEAMS[match.h].n
      const a = TEAMS[match.a].n

      if (!teams[h]) teams[h] = { name: h, flag: TEAMS[match.h].f, pj: 0, g: 0, gc: 0, pts: 0 }
      if (!teams[a]) teams[a] = { name: a, flag: TEAMS[match.a].f, pj: 0, g: 0, gc: 0, pts: 0 }

      teams[h].pj++
      teams[a].pj++

      const actual = actuals[match.id]
      if (actual !== undefined) {
        const hg = actual.h
        const ag = actual.a

        teams[h].g += hg
        teams[h].gc += ag
        teams[a].g += ag
        teams[a].gc += hg

        if (hg > ag) {
          teams[h].pts += 3
        } else if (ag > hg) {
          teams[a].pts += 3
        } else {
          teams[h].pts += 1
          teams[a].pts += 1
        }
      }
    })

    return Object.values(teams)
      .sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts
        return (b.g - b.gc) - (a.g - a.gc)
      })
  }

  return (
    <div className={styles.grupos}>
      <div className={styles.grid}>
        {groups.map(groupId => {
          const standings = getGroupStandings(groupId)

          return (
            <div key={groupId} className={styles.groupCard}>
              <div
                className={styles.groupTitle}
                style={{
                  borderColor: GROUP_COLORS[groupId]?.border,
                  color: GROUP_COLORS[groupId]?.text,
                }}
              >
                GRUPO {groupId}
              </div>

              <div className={styles.table}>
                <div className={styles.header}>
                  <div className={styles.team}>Equipo</div>
                  <div className={styles.stat}>PJ</div>
                  <div className={styles.stat}>G</div>
                  <div className={styles.stat}>GC</div>
                  <div className={styles.stat}>DG</div>
                  <div className={styles.stat}>Pts</div>
                </div>

                <div className={styles.rows}>
                  {standings.map((team, i) => (
                    <div key={team.name} className={styles.row}>
                      <div className={styles.teamCell}>
                        <span className={styles.flag}>{team.flag}</span>
                        <span className={styles.name}>{team.name}</span>
                      </div>
                      <div className={styles.stat}>{team.pj}</div>
                      <div className={styles.stat}>{team.g}</div>
                      <div className={styles.stat}>{team.gc}</div>
                      <div className={styles.stat}>{team.g - team.gc}</div>
                      <div className={styles.stat} style={{ fontWeight: 'bold', color: '#00d9ff' }}>
                        {team.pts}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
