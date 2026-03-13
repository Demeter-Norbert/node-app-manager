import { useState, useEffect, useRef } from 'react';

export interface ContainerStats {
  id: string;
  memory_usage_bytes: number;
  memory_limit_bytes: number;
  memory_percent: number;
  cpu_percent: number;
}

export interface SystemHistory {
  time: string;
  cpu: number;
  memory: number;
}

export const useSystemMonitor = (containerIds: string[]) => {
  const [currentStats, setCurrentStats] = useState<Record<string, ContainerStats>>({});
  const [history, setHistory] = useState<SystemHistory[]>([]);
  
  const statsRef = useRef<Record<string, ContainerStats>>({});
  const socketsRef = useRef<Map<string, WebSocket>>(new Map());

  useEffect(() => {
    const currentIds = new Set(containerIds);

    currentIds.forEach(id => {
      if (!socketsRef.current.has(id)) {
        const ws = new WebSocket(`ws://localhost:8000/api/monitor/${id}/stats/ws`);
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (!data.error) {
            statsRef.current = { ...statsRef.current, [id]: data };
            setCurrentStats({ ...statsRef.current }); 
          }
        };

        socketsRef.current.set(id, ws);
      }
    });

    for (const [id, ws] of socketsRef.current.entries()) {
      if (!currentIds.has(id)) {
        ws.close();
        socketsRef.current.delete(id);
        
        const newStats = { ...statsRef.current };
        delete newStats[id];
        statsRef.current = newStats;
        setCurrentStats(newStats);
      }
    }
  }, [containerIds]);

  useEffect(() => {
    const interval = setInterval(() => {
      const statsArray = Object.values(statsRef.current);
      if (statsArray.length > 0) {
        const totalCpu = statsArray.reduce((acc, curr) => acc + (curr.cpu_percent || 0), 0);
        const totalMem = statsArray.reduce((acc, curr) => acc + (curr.memory_usage_bytes || 0), 0) / (1024 * 1024);
        
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        setHistory(prev => {
          const newHistory = [...prev, { time: timeStr, cpu: Number(totalCpu.toFixed(2)), memory: Number(totalMem.toFixed(2)) }];
          return newHistory.slice(-20); 
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      socketsRef.current.forEach(ws => ws.close());
      socketsRef.current.clear();
      statsRef.current = {};
    };
  }, []);

  return { currentStats, history };
};