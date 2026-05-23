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
import { MATCHES } from '../data/matches'
import { calcTotalPts } from '../utils/scoring'
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
  Filler
)

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

    const tempActuals = {}
    matchesUpToDate.forEach(m => {
      if (actuals[m.id]) tempActuals[m.id] = actuals[m.id]
    })

    return calcTotalPts(participant, predictions, tempActuals, matchesUpToDate)
  }

  const datasets = participants.map((p, i) => {
    const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
    const points = dates.map(date => getPointsAfterDate(p, date))

    return {
      label: p,
      data: points,
      borderColor: color.b,
      backgroundColor: color.b + '30',
      fill: true,
      tension: 0.35,
      borderWidth: 2.5,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: color.b,
      pointBorderColor: 'white',
      pointBorderWidth: 2,
      pointStyle: 'circle',
    }
  })

  const chartData = {
    labels: dates,
    datasets,
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      title: {
        display: true,
        text: 'Evolución de Puntuación',
        color: '#cbd5e1',
        font: { size: 16, weight: '600' },
        padding: { bottom: 20 },
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#cbd5e1',
          font: { size: 12, weight: '500' },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        titleColor: '#00d9ff',
        titleFont: { size: 13, weight: '600' },
        bodyColor: '#cbd5e1',
        bodyFont: { size: 12 },
        borderColor: '#00d9ff',
        borderWidth: 1.5,
        padding: 12,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          afterLabel: () => '',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255,255,255,0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255,255,255,0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
        },
      },
    },
  }

  return (
    <div className={styles.evolucion}>
      <div className={styles.chartContainer}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
