import React from 'react';
import { Server, Cpu, MemoryStick } from "lucide-react";

interface StatsGridProps {
  runningCount: number;
  totalCpu: number;
  totalMemMb: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({ runningCount, totalCpu, totalMemMb }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sm:p-6 shadow-sm flex items-center gap-4 hover:border-gray-700 transition-colors">
        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg"><Server size={24} /></div>
        <div>
          <p className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wider">Running Apps</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{runningCount}</p>
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sm:p-6 shadow-sm flex items-center gap-4 hover:border-gray-700 transition-colors">
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg"><Cpu size={24} /></div>
        <div>
          <p className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wider">Total CPU</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{totalCpu.toFixed(1)} %</p>
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sm:p-6 shadow-sm flex items-center gap-4 hover:border-gray-700 transition-colors sm:col-span-2 lg:col-span-1">
        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg"><MemoryStick size={24} /></div>
        <div>
          <p className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wider">Total RAM</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{totalMemMb.toFixed(0)} MB</p>
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;