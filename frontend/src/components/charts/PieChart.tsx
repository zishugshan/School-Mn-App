import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface PieChartProps {
  data: ChartData<'pie'>
  options?: ChartOptions<'pie'>
  height?: number
}

const PieChart: React.FC<PieChartProps> = ({ data, options, height = 300 }) => {
  const defaultOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    ...options,
  }

  return (
    <div style={{ height }}>
      <Pie data={data} options={defaultOptions} />
    </div>
  )
}

export default PieChart
