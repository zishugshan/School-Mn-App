import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface BarChartProps {
  data: ChartData<'bar'>
  options?: ChartOptions<'bar'>
  height?: number
}

const BarChart: React.FC<BarChartProps> = ({ data, options, height = 300 }) => {
  const defaultOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.06)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    ...options,
  }

  return (
    <div style={{ height }}>
      <Bar data={data} options={defaultOptions} />
    </div>
  )
}

export default BarChart
