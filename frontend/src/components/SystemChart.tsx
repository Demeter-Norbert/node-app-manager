import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SystemHistory } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface SystemChartProps {
  data: SystemHistory[];
}

export default function SystemChart({ data }: SystemChartProps) {
  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        label: 'CPU %',
        data: data.map(d => d.cpu),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4, 
        pointRadius: 0, 
        borderWidth: 2,
      },
      {
        label: 'RAM MB',
        data: data.map(d => d.memory),
        borderColor: '#8b5cf6', 
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f3f4f6',
        bodyColor: '#e5e7eb', 
        borderColor: '#374151', 
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false, 
        },
        ticks: {
          color: '#9ca3af', 
          maxTicksLimit: 5, 
        },
      },
      y: {
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#9ca3af',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-[25vh] min-h-[200px] max-h-[350px] w-full mt-4">
      <Line data={chartData} options={options} />
    </div>
  );
}