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
        label: 'CPU',
        data: data.map(d => d.cpu),
        borderColor: '#3b82f6', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4, 
        pointRadius: 0, 
        borderWidth: 2,
        yAxisID: 'y', 
      },
      {
        label: 'RAM',
        data: data.map(d => d.memory),
        borderColor: '#10b981', 
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
        yAxisID: 'y1', 
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
        display: true,
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
          usePointStyle: true,
          boxWidth: 6,
          padding: 30, 
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f3f4f6',
        bodyColor: '#e5e7eb', 
        borderColor: '#374151', 
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
              label += context.dataset.label === 'CPU' ? '%' : ' MB';
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false, 
        },
        ticks: {
          color: '#9ca3af', 
          maxTicksLimit: 6, 
          maxRotation: 0,   
          autoSkipPadding: 15, 
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        max: 100, 
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#3b82f6', 
          callback: function(value: any) {
            return value + '%';
          }
        },
        beginAtZero: true,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false, 
        },
        ticks: {
          color: '#10b981',
          callback: function(value: any) {
            return value + ' MB';
          }
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-[25vh] min-h-[250px] max-h-[350px] w-full mt-2">
      <Line data={chartData} options={options as any} />
    </div>
  );
}