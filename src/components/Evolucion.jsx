import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import { useMemo } from 'react'
import { MATCHES } from '../data/matches'
import { calcTotalPts } from '../utils/scoring'
import { AVATAR_COLORS } from '../data/colors'
import { generateInitials } from '../utils/initials'
import styles from '../styles/Evolucion.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
)

export default function Evolucion({ participants, predictions, actuals }) {
  const matchIds = MATCHES.map(m => m.id)
  const maxMatchId = Math.max(...matchIds)
  const initialsMap = useMemo(() => generateInitials(participants), [participants])

  // Find the last match ID that has actual results
  let lastMatchWithResults = 0
  for (const matchId of matchIds) {
    if (actuals[matchId] !== undefined) {
      lastMatchWithResults = matchId
    }
  }

  // Usar datos simulados si hay muy pocos resultados (para demostración)
  const useSimulation = lastMatchWithResults === 0
  if (useSimulation) {
    lastMatchWithResults = 104
  }

  const visibleMatchIds = matchIds.filter(id => id <= lastMatchWithResults)

  const getPointsAfterMatch = (participant, upToMatchId) => {
    if (useSimulation) {
      // Generar puntos simulados basados en el índice del participante
      const pIndex = participants.indexOf(participant)
      const basePoints = pIndex * 5
      const matchProgress = (upToMatchId / 104)
      const variation = Math.sin(upToMatchId * 0.1 + pIndex) * 20
      return Math.floor(basePoints + (matchProgress * 200) + variation)
    }

    const matchesUpToId = MATCHES.filter(m => m.id <= upToMatchId)

    const tempActuals = {}
    matchesUpToId.forEach(m => {
      if (actuals[m.id]) tempActuals[m.id] = actuals[m.id]
    })

    return calcTotalPts(participant, predictions, tempActuals, matchesUpToId)
  }

  const datasets = participants.map((p, i) => {
    const color = AVATAR_COLORS[i % AVATAR_COLORS.length]

    // Generate points only up to the last match with results
    const points = visibleMatchIds.map(id => getPointsAfterMatch(p, id))

    return {
      label: p,
      data: points,
      borderColor: color.b,
      backgroundColor: color.b + '20',
      fill: true,
      tension: 0.4,
      cubicInterpolationMode: 'monotone',
      pointRadius: 0,
      pointHoverRadius: 6,
      pointBackgroundColor: color.b,
      pointBorderColor: '#354a65',
      pointBorderWidth: 2,
    }
  })

  const chartData = {
    labels: visibleMatchIds.map(id => `P${id}`),
    datasets,
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#cbd5e1',
          font: { size: 12, weight: '500' },
          padding: 15,
          usePointStyle: true,
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleColor: '#00d9ff',
        bodyColor: '#cbd5e1',
        borderColor: '#00d9ff',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
      },
      zoom: {
        limits: {
          y: { min: 0, max: 300 },
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,
          },
          pinch: {
            enabled: true,
          },
          mode: 'xy',
        },
        pan: {
          enabled: true,
          mode: 'xy',
          modifierKey: 'ctrl',
          scaleMode: 'xy',
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: Math.max(10, visibleMatchIds.length - 1),
        grid: {
          color: 'rgba(255,255,255,0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          callback: function(value) {
            if (typeof value === 'number' && value < visibleMatchIds.length) {
              return `P${visibleMatchIds[value]}`
            }
            return value
          },
        },
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 50,
        grid: {
          color: 'rgba(255,255,255,0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          callback: function(value) {
            if (Number.isInteger(value)) {
              return value
            }
            return ''
          },
        },
      },
    },
  }

  return (
    <div className={styles.evolucion}>
      <div className={styles.chartContainer}>
        <Line data={chartData} options={options} />
      </div>
      <div className={styles.customLegend}>
        {participants.map((p, i) => {
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
          return (
            <div key={p} className={styles.legendItem}>
              <div
                className={styles.legendAvatar}
                style={{ background: color.b, color: color.t }}
              >
                {initialsMap[p]}
              </div>
              <span className={styles.legendLabel}>{p}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
