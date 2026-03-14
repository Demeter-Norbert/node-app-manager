import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SystemHistory } from '../hooks/useSystemMonitor';

interface SystemChartProps {
  data: SystemHistory[];
}

export default function SystemChart({ data }: SystemChartProps) {
  return (
    <div className="h-[25vh] min-h-[200px] max-h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickMargin={10} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
            itemStyle={{ color: '#e5e7eb' }}
          />
          <Area type="monotone" dataKey="cpu" name="CPU (%)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" />
          <Area type="monotone" dataKey="memory" name="RAM (MB)" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMem)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}