import { useState, useEffect, useRef } from 'react';
import { X, Terminal as TerminalIcon } from 'lucide-react';

function TerminalSession({ appId, isActive }: { appId: string, isActive: boolean }) {
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
    return () => ws.close();
  }, [appId]);

  let isInErrorBlock = false;

  const filteredLogs = logs.filter(log => {
    const regex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.\d+Z\s?(.*)/;
    const match = log.match(regex);
    const msg = match ? match[2] : log;
    return msg.trim() !== ""; 
  });

  const parsedLogs = filteredLogs.map((log, index) => {
    const regex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.\d+Z\s?(.*)/;
    const match = log.match(regex);

    let timeStr = "";
    let messageStr = log;

    if (match) {
      timeStr = match[1].replace('T', ' ');
      messageStr = match[2];
    }

    let showTime = true;
    if (index > 0) {
      const prevMatch = filteredLogs[index - 1].match(regex);
      if (prevMatch && prevMatch[1].replace('T', ' ') === timeStr) {
        showTime = false;
      }
    }

    const lowerMsg = messageStr.toLowerCase();
    const isErrorKeyword = lowerMsg.includes("error") || lowerMsg.includes("err!") || lowerMsg.includes("failed") || lowerMsg.includes("exception");
    
    const isContinuation = 
      messageStr.startsWith(" ") ||         
      messageStr.startsWith("}") ||         
      messageStr.startsWith("]") ||         
      messageStr.startsWith("/") ||         
      messageStr.trim().startsWith("^") ||  
      messageStr.trim().startsWith("throw ") || 
      messageStr.startsWith("at ");         

    if (isErrorKeyword) {
      isInErrorBlock = true;
    } else if (!isContinuation) {
      isInErrorBlock = false;
    }

    let textColor = "text-green-400";
    if (isInErrorBlock) {
      textColor = isErrorKeyword ? "text-red-400 font-bold" : "text-red-400/80"; 
    } else if (lowerMsg.includes("warn")) {
      textColor = "text-yellow-400";
    }

    return { timeStr, showTime, messageStr, textColor };
  });

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

interface LogViewerProps {
  apps: {id: string, name: string}[];
  activeAppId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCloseAll: () => void;
}

export default function LogViewer({ apps, activeAppId, onSelectTab, onCloseTab, onCloseAll }: LogViewerProps) {
  return (
    <div className="fixed top-0 right-0 z-50 h-screen w-full sm:w-[400px] lg:w-[600px] xl:w-[800px] bg-gray-950 border-l border-gray-700 shadow-2xl flex flex-col transition-all duration-300 ease-in-out">
      
      <div className="flex items-center justify-between bg-gray-900 border-b border-gray-800 pr-2">
        
        <div className="flex-1 flex items-center pt-2 px-2 overflow-x-auto custom-scrollbar min-h-[48px]">
          {apps.map((app) => {
            const isActive = app.id === activeAppId;
            return (
              <div 
                key={app.id}
                onClick={() => onSelectTab(app.id)}
                className={`group flex items-center gap-2 px-4 py-2 text-sm font-medium border-t-2 cursor-pointer transition-colors whitespace-nowrap ${
                  isActive 
                    ? "border-blue-500 bg-gray-950 text-blue-400" 
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                }`}
              >
                <TerminalIcon size={16} />
                <span className="font-mono">{app.name}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(app.id);
                  }}
                  className={`p-0.5 rounded-md ${isActive ? "hover:bg-gray-800" : "hover:bg-gray-700"} opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="pl-2 border-l border-gray-800 flex-shrink-0">
          <button 
            onClick={onCloseAll}
            className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            title="Close Terminal"
          >
            <X size={20} />
          </button>
        </div>

      </div>

      {apps.map((app) => (
        <TerminalSession 
          key={app.id} 
          appId={app.id} 
          isActive={app.id === activeAppId} 
        />
      ))}
      
    </div>
  );
}