import { calcTotalPts } from '../utils/scoring'
import { MATCHES } from '../data/matches'
import { AVATAR_COLORS } from '../data/colors'
import styles from '../styles/Clasificacion.module.css'

export default function Clasificacion({ participants, predictions, actuals }) {
  const standings = participants.map((p, i) => ({
    name: p,
    pts: calcTotalPts(p, predictions, actuals, MATCHES),
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
  })).sort((a, b) => b.pts - a.pts)

  return (
    <div className={styles.clasificacion}>
      <div className={styles.table}>
        <div className={styles.header}>
          <div className={styles.pos}>Pos</div>
          <div className={styles.name}>Participante</div>
          <div className={styles.pts}>Puntos</div>
        </div>

        <div className={styles.rows}>
          {standings.map((p, i) => (
            <div key={p.name} className={styles.row}>
              <div className={styles.pos}>{i + 1}º</div>
              <div className={styles.nameSection}>
                <div
                  className={styles.avatar}
                  style={{ background: p.color.b, color: p.color.t }}
                >
                  {p.name[0]}
                </div>
                <span className={styles.nameText}>{p.name}</span>
              </div>
              <div className={styles.pts}>{p.pts}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
