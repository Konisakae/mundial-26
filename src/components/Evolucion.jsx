import { useState, useMemo, useEffect } from 'react'
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

const ExpandIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.7092 2.29502C21.8041 2.3904 21.8757 2.50014 21.9241 2.61722C21.9727 2.73425 21.9996 2.8625 22 2.997L22 3V9C22 9.55228 21.5523 10 21 10C20.4477 10 20 9.55228 20 9V5.41421L14.7071 10.7071C14.3166 11.0976 13.6834 11.0976 13.2929 10.7071C12.9024 10.3166 12.9024 9.68342 13.2929 9.29289L18.5858 4H15C14.4477 4 14 3.55228 14 3C14 2.44772 14.4477 2 15 2H20.9998C21.2749 2 21.5242 2.11106 21.705 2.29078L21.7092 2.29502Z" fill="currentColor"/>
    <path d="M10.7071 14.7071L5.41421 20H9C9.55228 20 10 20.4477 10 21C10 21.5523 9.55228 22 9 22H3.00069L2.997 22C2.74301 21.9992 2.48924 21.9023 2.29502 21.7092L2.29078 21.705C2.19595 21.6096 2.12432 21.4999 2.07588 21.3828C2.02699 21.2649 2 21.1356 2 21V15C2 14.4477 2.44772 14 3 14C3.55228 14 4 14.4477 4 15V18.5858L9.29289 13.2929C9.68342 12.9024 10.3166 12.9024 10.7071 13.2929C11.0976 13.6834 11.0976 14.3166 10.7071 14.7071Z" fill="currentColor"/>
  </svg>
)

const ContractIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.7071 3.70711L16.4142 9H20C20.5523 9 21 9.44772 21 10C21 10.5523 20.5523 11 20 11H14.0007L13.997 11C13.743 10.9992 13.4892 10.9023 13.295 10.7092L13.2908 10.705C13.196 10.6096 13.1243 10.4999 13.0759 10.3828C13.0273 10.2657 13.0004 10.1375 13 10.003L13 10V4C13 3.44772 13.4477 3 14 3C14.5523 3 15 3.44772 15 4V7.58579L20.2929 2.29289C20.6834 1.90237 21.3166 1.90237 21.7071 2.29289C22.0976 2.68342 22.0976 3.31658 21.7071 3.70711Z" fill="currentColor"/>
    <path d="M9 20C9 20.5523 9.44772 21 10 21C10.5523 21 11 20.5523 11 20V14.0007C11 13.9997 11 13.998 11 13.997C10.9992 13.7231 10.8883 13.4752 10.7092 13.295C10.7078 13.2936 10.7064 13.2922 10.705 13.2908C10.6096 13.196 10.4999 13.1243 10.3828 13.0759C10.2657 13.0273 10.1375 13.0004 10.003 13C10.002 13 10.001 13 10 13H4C3.44772 13 3 13.4477 3 14C3 14.5523 3.44772 15 4 15H7.58579L2.29289 20.2929C1.90237 20.6834 1.90237 21.3166 2.29289 21.7071C2.68342 22.0976 3.31658 22.0976 3.70711 21.7071L9 16.4142V20Z" fill="currentColor"/>
  </svg>
)

export default function Evolucion({ participants, predictions, actuals, resultsConfirmed = {} }) {
  const [viewType, setViewType] = useState('partidos')
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [windowStart, setWindowStart] = useState(0)
  const [showAll, setShowAll] = useState(false)

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

  // Cálculo de ventana deslizante para "Por partidos"
  const windowSize = 10
  const maxWindowStart = Math.max(0, visibleMatchIds.length - windowSize)
  const clampedWindowStart = Math.min(windowStart, maxWindowStart)
  const windowedMatchIds = showAll ? visibleMatchIds : visibleMatchIds.slice(clampedWindowStart, clampedWindowStart + windowSize)

  // Mostrar automáticamente los últimos 10 partidos cuando se agregan nuevos
  useEffect(() => {
    setWindowStart(maxWindowStart)
  }, [visibleMatchIds.length])

  const getPointsAfterMatch = (participant, upToMatchId) => {
    const matchesUpToId = MATCHES.filter(m => m.id <= upToMatchId)

    const tempActuals = {}
    matchesUpToId.forEach(m => {
      if (actuals[m.id]) tempActuals[m.id] = actuals[m.id]
    })

    return calcTotalPts(participant, predictions, tempActuals, matchesUpToId)
  }

  // Calcular min/max de puntos en la ventana visible
  let minPts = Infinity, maxPts = 0
  participants.forEach(p => {
    windowedMatchIds.forEach(id => {
      const pts = getPointsAfterMatch(p, id)
      minPts = Math.min(minPts, pts)
      maxPts = Math.max(maxPts, pts)
    })
  })
  minPts = isFinite(minPts) ? minPts : 0
  // Margen del 10% arriba y abajo
  const ptsRange = maxPts - minPts || 1
  const yMin = Math.max(0, minPts - ptsRange * 0.1)
  const yMax = maxPts + ptsRange * 0.1

  const datasets = participants.map((p, i) => {
    const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
    const isSelected = selectedParticipant === null || selectedParticipant === p

    // Generate points only for windowed matches
    const points = windowedMatchIds.map(id => getPointsAfterMatch(p, id))

    return {
      label: p,
      data: points,
      borderColor: isSelected ? hexToRgba(color.b, 0.8) : hexToRgba(color.b, 0.2),
      borderWidth: isSelected ? 2.5 : 1,
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.4,
      cubicInterpolationMode: 'monotone',
      pointRadius: showAll ? 0 : (isSelected ? 4 : 2),
      pointHoverRadius: 6,
      pointBackgroundColor: color.b,
      pointBorderColor: '#354a65',
      pointBorderWidth: 0,
    }
  })

  const chartData = {
    labels: windowedMatchIds.map(id => `P${id}`),
    datasets,
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    },
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
          callback: function(value) {
            if (typeof value === 'number' && value < windowedMatchIds.length) {
              return `P${windowedMatchIds[value]}`
            }
            return value
          },
        },
      },
      y: {
        beginAtZero: false,
        offset: true,
        min: Math.floor(yMin),
        max: Math.ceil(yMax),
        width: 90,
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
          stepSize: 1,
          padding: 2,
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
  const allPhasesFullList = ['J1', 'J2', 'J3', 'R16', 'R8', 'R4', 'SF', '3P', 'F']
  const allLabels = allPhasesFullList // Mostrar todas las fases en el eje X

  // Detectar qué fases tienen datos para no dibujar null donde no hay nada
  const phaseToMatches = {
    'J1': getMatchesForJornada(MATCHES, 1),
    'J2': getMatchesForJornada(MATCHES, 2),
    'J3': getMatchesForJornada(MATCHES, 3),
    'R16': MATCHES.filter(m => m.ph === 'R16'),
    'R8': MATCHES.filter(m => m.ph === 'OCT'),
    'R4': MATCHES.filter(m => m.ph === 'CTO'),
    'SF': MATCHES.filter(m => m.ph === 'SEMI'),
    '3P': MATCHES.filter(m => m.ph === '3P'),
    'F': MATCHES.filter(m => m.ph === 'FIN'),
  }

  const phasesWithData = {}
  for (const phase of allPhasesFullList) {
    const phaseMatches = phaseToMatches[phase] || []
    phasesWithData[phase] = phaseMatches.some(m => actuals[m.id])
  }

  const rankingDatasets = participants.map((p, i) => {
    const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
    const points = allLabels.map((phase) => {
      // Mostrar ranking solo para fases con datos, null para las vacías
      if (phasesWithData[phase]) {
        return rankingsByPhase[p]?.[phase] || 13
      }
      return null
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
        max: 13,
        reverse: true,
        ticks: {
          color: '#cbd5e1',
          font: { size: 12 },
          stepSize: 1,
          callback: function(value) {
            if (value >= 1 && value <= 12) {
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
          Por partido
        </button>
        <button
          className={`${styles.tabBtn} ${viewType === 'ranking' ? styles.tabActive : ''}`}
          onClick={() => setViewType('ranking')}
        >
          Por ronda
        </button>
      </div>

      {viewType === 'partidos' && (
        <div className={styles.navigation}>
          <button
            onClick={() => setWindowStart(Math.max(0, windowStart - 8))}
            disabled={showAll || windowStart === 0}
            className={styles.navBtn}
          >
            <div className={styles.navArrow}>←</div>
            <div>Anterior</div>
          </button>

          <span className={styles.navInfo}>
            {showAll ? `1 - ${visibleMatchIds.length} de ${visibleMatchIds.length}` : `${clampedWindowStart + 1} - ${clampedWindowStart + windowedMatchIds.length} de ${visibleMatchIds.length}`}
          </span>

          <button
            onClick={() => setWindowStart(Math.min(maxWindowStart, windowStart + 8))}
            disabled={showAll || clampedWindowStart >= maxWindowStart}
            className={styles.navBtn}
          >
            <div className={styles.navArrow}>→</div>
            <div>Siguiente</div>
          </button>

          <button
            onClick={() => setShowAll(!showAll)}
            className={styles.navBtn}
            title={showAll ? 'Ventana de 10 partidos' : 'Mostrar todos los partidos'}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {showAll ? <ContractIcon /> : <ExpandIcon />}
          </button>
        </div>
      )}

      <div className={styles.chartContainer}>
        {viewType === 'partidos' && <Line data={chartData} options={options} />}
        {viewType === 'ranking' && <Line data={rankingChartData} options={rankingOptions} />}
      </div>
    </div>
  )
}
