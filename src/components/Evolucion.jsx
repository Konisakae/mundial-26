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
      backgroundColor: color.b + '20',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: color.b,
      pointBorderColor: '#354a65',
      pointBorderWidth: 2,
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
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#cbd5e1',
          font: { size: 12 },
          padding: 15,
          usePointStyle: true,
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
