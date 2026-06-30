import { useState, useEffect, useRef } from 'react';
import { ContainerStats, SystemHistory } from '../types';

const WS_BASE = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;

export const useSystemMonitor = (containerIds: string[]) => {
  const [currentStats, setCurrentStats] = useState<Record<string, ContainerStats>>({});
  const [history, setHistory] = useState<SystemHistory[]>([]);
  
  const statsRef = useRef<Record<string, ContainerStats>>({});
  const socketsRef = useRef<Map<string, WebSocket>>(new Map());
  const reconnectTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const currentIds = new Set(containerIds);

    const connect = (id: string) => {
      const ws = new WebSocket(`${WS_BASE}/api/monitor/${id}/stats/ws`);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!data.error) {
          statsRef.current = { ...statsRef.current, [id]: data };
          setCurrentStats({ ...statsRef.current });
        }
      };

      ws.onclose = () => {
        if (socketsRef.current.has(id)) {
          const timeout = setTimeout(() => connect(id), 3000);
          reconnectTimeoutsRef.current.set(id, timeout);
        }
      };

      socketsRef.current.set(id, ws);
    };

    currentIds.forEach(id => {
      if (!socketsRef.current.has(id)) {
        connect(id);
      }
    });

    for (const [id, ws] of socketsRef.current.entries()) {
      if (!currentIds.has(id)) {
        const pending = reconnectTimeoutsRef.current.get(id);
        if (pending) {
          clearTimeout(pending);
          reconnectTimeoutsRef.current.delete(id);
        }
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
      reconnectTimeoutsRef.current.forEach(t => clearTimeout(t));
      reconnectTimeoutsRef.current.clear();
      socketsRef.current.forEach(ws => ws.close());
      socketsRef.current.clear();
      statsRef.current = {};
    };
  }, []);

  return { currentStats, history };
};