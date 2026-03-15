import { useState, useEffect, useRef, useMemo } from 'react';
import { parseLogs } from '../utils/logParser';

interface TerminalSessionProps {
  appId: string;
  isActive: boolean;
}

export default function TerminalSession({ appId, isActive }: TerminalSessionProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isActive]);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/api/monitor/${appId}/logs/ws`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.logs) {
        setLogs((prevLogs) => {
          if (prevLogs.length === 0) return data.logs;
          const isSameLength = prevLogs.length === data.logs.length;
          const isSameLastLine = prevLogs[prevLogs.length - 1] === data.logs[data.logs.length - 1];
          if (isSameLength && isSameLastLine) return prevLogs; 
          return data.logs; 
        });
      }
    };
    return () => {
      if (ws.readyState === 1) { 
        ws.close();
      }
    };
  }, [appId]);

  const parsedLogs = useMemo(() => parseLogs(logs), [logs]);

  return (
    <div className={`flex-1 overflow-y-auto p-4 font-mono text-sm bg-black custom-scrollbar ${isActive ? 'block' : 'hidden'}`}>
      {parsedLogs.length === 0 ? (
        <div className="text-gray-500 animate-pulse">Waiting for logs...</div>
      ) : (
        parsedLogs.map((logData, index) => (
          <div key={index} className="hover:bg-gray-900/50 px-1 rounded flex gap-3">
            <div className="w-[185px] shrink-0 whitespace-nowrap text-gray-500 select-none">
              {logData.showTime && logData.timeStr ? `[${logData.timeStr}]` : ""}
            </div>
            <span className={`${logData.textColor} whitespace-pre-wrap break-all flex-1`}>
              {logData.messageStr}
            </span>
          </div>
        ))
      )}
      <div ref={logsEndRef} />
    </div>
  );
}