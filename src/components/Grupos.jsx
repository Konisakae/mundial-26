import { MATCHES } from '../data/matches'
import { TEAMS } from '../data/teams'
import { GROUP_COLORS } from '../data/groupColors'
import { useIsMobile } from '../hooks/useIsMobile'
import styles from '../styles/Grupos.module.css'

export default function Grupos({ actuals, selectedThirds = {} }) {
  const isMobile = useIsMobile()
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

  // Extraer qué grupos fueron seleccionados para R16
  const selectedGroups = new Set(Object.values(selectedThirds))

  const getGroupStandings = (groupId) => {
    const groupMatches = MATCHES.filter(m => m.ph === 'G' && m.gr === groupId)
    const teams = {}

    groupMatches.forEach(match => {
      const h = TEAMS[match.h].n
      const a = TEAMS[match.a].n

      if (!teams[h]) teams[h] = { name: h, code: match.h, flag: TEAMS[match.h].f, pj: 0, g: 0, gc: 0, pts: 0 }
      if (!teams[a]) teams[a] = { name: a, code: match.a, flag: TEAMS[match.a].f, pj: 0, g: 0, gc: 0, pts: 0 }

      const actual = actuals[match.id]
      if (actual !== undefined) {
        teams[h].pj++
        teams[a].pj++
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
          const groupMatches = MATCHES.filter(m => m.ph === 'G' && m.gr === groupId)
          const hasResults = groupMatches.some(m => actuals[m.id] !== undefined)

          return (
            <div
              key={groupId}
              className={styles.groupCard}
              style={{
                borderColor: '#94a3b8',
                borderWidth: '2px',
              }}
            >
              <div
                className={styles.groupTitle}
                style={{
                  backgroundColor: GROUP_COLORS[groupId]?.border,
                  color: 'white',
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
                  {standings.map((team, i) => {
                    let rowClass = styles.row
                    if (hasResults) {
                      if (i === 0) rowClass += ` ${styles.rowFirst}`
                      else if (i === 1) rowClass += ` ${styles.rowSecond}`
                      else if (i === 2) {
                        if (selectedGroups.size > 0 && !selectedGroups.has(groupId)) {
                          rowClass += ` ${styles.rowFourth}`
                        } else {
                          rowClass += ` ${styles.rowThird}`
                        }
                      }
                      else if (i === 3) rowClass += ` ${styles.rowFourth}`
                    }
                    return (
                      <div key={team.name} className={rowClass}>
                      <div className={styles.teamCell}>
                        <span className={styles.flag}>{team.flag}</span>
                        <span className={styles.name}>{isMobile ? team.code : team.name}</span>
                      </div>
                      <div className={styles.stat}>{team.pj}</div>
                      <div className={styles.stat}>{team.g}</div>
                      <div className={styles.stat}>{team.gc}</div>
                      <div className={styles.stat}>{team.g - team.gc}</div>
                      <div className={styles.stat} style={{ fontWeight: 'bold', color: '#00d9ff' }}>
                        {team.pts}
                      </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
