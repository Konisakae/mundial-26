import { MATCHES } from '../data/matches'
import { calcTotalPts } from '../utils/scoring'
import { AVATAR_COLORS } from '../data/colors'
import styles from '../styles/Evolucion.module.css'

export default function Evolucion({ participants, predictions, actuals }) {
  const dates = [...new Set(MATCHES.map(m => m.dt))].sort((a, b) => {
    const [da, ma, ya] = a.split('/').map(Number)
    const [db, mb, yb] = b.split('/').map(Number)
    return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db)
  })

  const getPointsAfterDate = (participant, upToDate) => {
    const matchesUpToDate = MATCHES.filter(m => {
      const [d, mo] = m.dt.split('/').map(Number)
      const [du, mou] = upToDate.split('/').map(Number)
      const dateM = new Date(2026, mo - 1, d)
      const dateU = new Date(2026, mou - 1, du)
      return dateM <= dateU
    })

    const relevantMatches = matchesUpToDate
    const tempMatches = relevantMatches

    const tempActuals = {}
    matchesUpToDate.forEach(m => {
      if (actuals[m.id]) tempActuals[m.id] = actuals[m.id]
    })

    return calcTotalPts(participant, predictions, tempActuals, tempMatches)
  }

  const evolution = participants.map((p, i) => ({
    name: p,
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    points: dates.map(date => getPointsAfterDate(p, date)),
  }))

  return (
    <div className={styles.evolucion}>
      <div className={styles.container}>
        <div className={styles.chart}>
          <div className={styles.legend}>
            {evolution.map(p => (
              <div key={p.name} className={styles.legendItem}>
                <div
                  className={styles.legendColor}
                  style={{ background: p.color.b }}
                />
                <span>{p.name}</span>
              </div>
            ))}
          </div>

          <div className={styles.grid}>
            <div className={styles.yAxis}>
              {[0, 25, 50, 75, 100].map(val => (
                <div key={val} className={styles.yLabel}>
                  {val}
                </div>
              ))}
            </div>

            <div className={styles.plotArea}>
              {evolution.map(p => (
                <div key={p.name} className={styles.line}>
                  {p.points.map((pt, i) => (
                    <div
                      key={i}
                      className={styles.point}
                      style={{
                        left: `${(i / (dates.length - 1 || 1)) * 100}%`,
                        bottom: `${(pt / 150) * 100}%`,
                        background: p.color.b,
                      }}
                      title={`${p.name}: ${pt} pts (${dates[i]})`}
                    />
                  ))}
                </div>
              ))}

              <div className={styles.xAxis}>
                {dates.map((date, i) => (
                  <div key={date} className={styles.xLabel} style={{ left: `${(i / (dates.length - 1 || 1)) * 100}%` }}>
                    {date}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.table}>
          <div className={styles.header}>
            <div className={styles.participant}>Participante</div>
            {dates.map(date => (
              <div key={date} className={styles.dateCol}>
                {date}
              </div>
            ))}
          </div>

          <div className={styles.rows}>
            {evolution.map(p => (
              <div key={p.name} className={styles.row}>
                <div className={styles.participant}>
                  <div
                    className={styles.avatar}
                    style={{ background: p.color.b, color: p.color.t }}
                  >
                    {p.name[0]}
                  </div>
                  <span>{p.name}</span>
                </div>
                {p.points.map((pts, i) => (
                  <div key={i} className={styles.dateCol}>
                    {pts}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
