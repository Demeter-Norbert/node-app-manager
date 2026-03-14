import { X, Terminal as TerminalIcon } from 'lucide-react';
import TerminalSession from './TerminalSession';

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