import { useState, useMemo } from 'react'
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
import { MATCHES } from '../data/matches'
import { calcTotalPts } from '../utils/scoring'
import { getMatchesForJornada } from '../utils/jornadas'
import { AVATAR_COLORS } from '../data/colors'
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

const hexToRgba = (hex, alpha = 0.8) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function Evolucion({ participants, predictions, actuals, resultsConfirmed = {} }) {
  const [viewType, setViewType] = useState('partidos')
  const [selectedParticipant, setSelectedParticipant] = useState(null)

  // Determinar la última fase/jornada confirmada
  const getLastConfirmedPhase = () => {
    // Claves en resultsConfirmed: 1, 2, 3 (jornadas), R16, OCT, CTO, SEMI, 3P, FIN (fases)
    const confirmationKeys = [1, 2, 3, 'R16', 'OCT', 'CTO', 'SEMI', '3P', 'FIN']
    const phaseLabels = ['J1', 'J2', 'J3', 'R16', 'R8', 'R4', 'SF', '3P', 'F']

    let lastIdx = -1
    for (let i = 0; i < confirmationKeys.length; i++) {
      if (resultsConfirmed[confirmationKeys[i]]) {
        lastIdx = i
      }
    }
    return lastIdx >= 0 ? phaseLabels[lastIdx] : null
  }

  const lastConfirmedPhase = getLastConfirmedPhase()

  const matchIds = MATCHES.map(m => m.id)
  const maxMatchId = Math.max(...matchIds)

  // Find the last match ID that has actual results
  let lastMatchWithResults = 0
  for (const matchId of matchIds) {
    if (actuals[matchId] !== undefined) {
      lastMatchWithResults = matchId
    }
  }

  const visibleMatchIds = matchIds.filter(id => id <= lastMatchWithResults)

  const getPointsAfterMatch = (participant, upToMatchId) => {
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
      pointBorderWidth: 0,
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

  // Calcular rankings por jornada/fase (posición total acumulada)
  const rankingsByPhase = useMemo(() => {
    const phases = ['J1', 'J2', 'J3', 'R16', 'R8', 'R4', 'SF', '3P', 'F']
    const phaseMap = { 'R16': 'R16', 'R8': 'OCT', 'R4': 'CTO', 'SF': 'SEMI', '3P': '3P', 'F': 'FIN' }
    const rankings = {}

    phases.forEach(phase => {
      const scores = {}

      // Construir array de matches acumulados hasta esta fase
      let accumulatedMatches = []

      // Agregar jornadas 1-3 según corresponda
      if (phase === 'J1' || phase === 'J2' || phase === 'J3') {
        const jornada = parseInt(phase.charAt(1))
        for (let j = 1; j <= jornada; j++) {
          accumulatedMatches = accumulatedMatches.concat(getMatchesForJornada(MATCHES, j))
        }
      } else {
        // Agregar todas las jornadas 1-3
        for (let j = 1; j <= 3; j++) {
          accumulatedMatches = accumulatedMatches.concat(getMatchesForJornada(MATCHES, j))
        }

        // Agregar fases eliminatorias hasta la actual
        const phaseOrder = ['R16', 'OCT', 'CTO', 'SEMI', '3P', 'FIN']
        const internalPhase = phaseMap[phase]
        const phaseIdx = phaseOrder.indexOf(internalPhase)
        for (let i = 0; i <= phaseIdx; i++) {
          accumulatedMatches = accumulatedMatches.concat(MATCHES.filter(m => m.ph === phaseOrder[i]))
        }
      }

      // Calcular puntos totales acumulados para cada participante
      participants.forEach(p => {
        // Construir objeto de actuals solo para matches con resultados
        const accumulatedActuals = {}
        accumulatedMatches.forEach(m => {
          if (actuals[m.id]) {
            accumulatedActuals[m.id] = actuals[m.id]
          }
        })
        const pts = calcTotalPts(p, predictions, accumulatedActuals, accumulatedMatches) || 0
        scores[p] = pts
      })

      // Ranking por puntos totales
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
      sorted.forEach((entry, idx) => {
        if (!rankings[entry[0]]) rankings[entry[0]] = {}
        rankings[entry[0]][phase] = idx + 1
      })
    })

    return rankings
  }, [participants, predictions, actuals])

  // Gráfica de evolución acumulada (ranking)
  const allPhases = ['J1', 'J2', 'J3', 'R16', 'R8', 'R4', 'SF', '3P', 'F']
  const allLabels = ['J1', 'J2', 'J3', 'R16', 'R8', 'R4', 'SF', '3P', 'F']

  // Determinar qué fases mostrar: todas, pero con datos null para las no confirmadas
  const lastConfirmedIdx = lastConfirmedPhase ? allPhases.indexOf(lastConfirmedPhase) : allPhases.length - 1

  const rankingDatasets = participants.map((p, i) => {
    const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
    const points = allPhases.map((phase, idx) => {
      if (idx <= lastConfirmedIdx) {
        return rankingsByPhase[p]?.[phase] || 13
      }
      return null // Datos no confirmados aparecen como vacíos
    })

    const isSelected = selectedParticipant === null || selectedParticipant === p
    return {
      label: p,
      data: points,
      borderColor: isSelected ? hexToRgba(color.b, 0.8) : hexToRgba(color.b, 0.2),
      borderWidth: isSelected ? 2.5 : 1,
      backgroundColor: color.b,
      fill: false,
      tension: 0.4,
      pointRadius: isSelected ? 4 : 2,
      pointHoverRadius: 6,
      pointBackgroundColor: color.b,
      pointBorderColor: '#354a65',
      pointBorderWidth: 0,
    }
  })

  const rankingChartData = {
    labels: allLabels,
    datasets: rankingDatasets,
  }

  const rankingOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        maxWidth: 750,
        labels: {
          color: '#cbd5e1',
          font: { size: 12, weight: '500' },
          padding: 20,
          usePointStyle: true,
          boxWidth: 12,
          boxHeight: 12,
        },
        onClick: (e, legendItem, legend) => {
          const participantName = legendItem.text
          setSelectedParticipant(selectedParticipant === participantName ? null : participantName)
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
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 0,
        max: 14,
        reverse: true,
        ticks: {
          color: '#cbd5e1',
          font: { size: 12 },
          stepSize: 1,
          callback: function(value) {
            if (value >= 1 && value <= 13) {
              return value + '°'
            }
            return ''
          }
        },
        border: {
          display: true,
          color: '#ffffff',
          width: 2,
        },
        grid: {
          color: 'rgba(255,255,255,0.05)',
          drawBorder: false,
        },
      },
      x: {
        offset: true,
        border: {
          display: true,
          color: '#ffffff',
          width: 2,
        },
        grid: {
          color: 'rgba(255,255,255,0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#cbd5e1',
          font: { size: 12 },
        },
      },
    },
  }

  return (
    <div className={styles.evolucion}>
      <div className={styles.controls}>
        <button
          className={`${styles.tabBtn} ${viewType === 'partidos' ? styles.tabActive : ''}`}
          onClick={() => setViewType('partidos')}
        >
          Por partidos
        </button>
        <button
          className={`${styles.tabBtn} ${viewType === 'ranking' ? styles.tabActive : ''}`}
          onClick={() => setViewType('ranking')}
        >
          Evolución
        </button>
      </div>

      <div className={styles.chartContainer}>
        {viewType === 'partidos' && <Line data={chartData} options={options} />}
        {viewType === 'ranking' && <Line data={rankingChartData} options={rankingOptions} />}
      </div>
    </div>
  )
}
