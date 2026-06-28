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
  ChartData,
  ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface LineChartProps {
  data: ChartData<'line'>
  options?: ChartOptions<'line'>
  height?: number
}

const LineChart: React.FC<LineChartProps> = ({ data, options, height = 300 }) => {
  const defaultOptions: ChartOptions<'line'> = {
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
      <Line data={data} options={defaultOptions} />
    </div>
  )
}

export default LineChart
