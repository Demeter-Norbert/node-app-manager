import { useState, useEffect, useMemo } from "react";
import { DockerContainer } from './types';
import { fetchContainers, startApp } from "./services/api";
import DockerTable from "./components/DockerTable";
import SystemChart from "./components/SystemChart";
import LogViewer from "./components/LogViewer";
import NtfyBanner from "./components/NtfyBanner";
import StatsGrid from "./components/StatsGrid";
import CreateAppForm from "./components/CreateAppForm";
import { useSystemMonitor } from "./hooks/useSystemMonitor";
import { Server, AlertCircle, Bell } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

function App() {
  const [apps, setApps] = useState<DockerContainer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openLogs, setOpenLogs] = useState<{id: string, name: string}[]>([]);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [isNtfyExpanded, setIsNtfyExpanded] = useState(false);

  const ntfyTopic = "NodeJS_App_Manager_123456789987654321";

  const loadData = async () => {
    try {
      setError(null);
      const data = await fetchContainers();
      setApps(data);
    } catch (err) {
      setError("Failed to connect to the backend. Is the server running ?");
    }
  };

  useEffect(() => {
    loadData();
    const timerId = setInterval(loadData, 3000);
    return () => clearInterval(timerId);
  }, []);

  const runningIds = useMemo(() => 
    apps.filter(a => a.status.includes("running") || a.status.includes("Up")).map(a => a.id)
  , [apps]);

  const { currentStats, history } = useSystemMonitor(runningIds);

  const totalCpu = Object.values(currentStats).reduce((acc, curr) => acc + (curr.cpu_percent || 0), 0);
  const totalMemMb = Object.values(currentStats).reduce((acc, curr) => acc + (curr.memory_usage_bytes || 0), 0) / (1024 * 1024);

  const handleDeploy = async (name: string, port: number, image: string) => {
    try {
      await startApp(name, port, image);
      loadData();
      toast.success(`${name} deployed successfully!`); 
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.error(err.response.data.detail);
      } else {
        toast.error("An error occurred while creating the application.");
      }
    }
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 mx-auto transition-all duration-300 ${
      openLogs.length > 0 ? 'lg:pr-[600px] xl:pr-[824px] max-w-full' : 'max-w-[1600px]'
    }`}>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#1f2937' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1f2937' } },
        }}
      />

      <header className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8 w-full">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-blue-600/20 text-blue-400 rounded-lg"><Server size={28} /></div>
          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight text-white">Node.js Manager</h1>
        </div>

        {!isNtfyExpanded && (
          <button 
            onClick={() => setIsNtfyExpanded(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-950/30 border border-indigo-500/30 hover:bg-indigo-900/50 text-indigo-300 rounded-full transition-all"
          >
            <Bell size={18} /> <span className="text-sm font-medium">Ntfy alerts</span>
          </button>
        )}
      </header>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg">
          <AlertCircle size={20} className="shrink-0" />
          <div>
            <p className="font-semibold">Backend Unreachable</p>
            <p className="text-sm text-red-400/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <NtfyBanner ntfyTopic={ntfyTopic} isExpanded={isNtfyExpanded} onToggle={setIsNtfyExpanded} />
      
      <StatsGrid runningCount={runningIds.length} totalCpu={totalCpu} totalMemMb={totalMemMb} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <CreateAppForm onDeploy={handleDeploy} />
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hidden lg:block">
             <h3 className="text-lg font-semibold text-gray-200 mb-2">Resource Monitor</h3>
             <SystemChart data={history} />
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
            {!error && (
              <DockerTable 
                containers={apps} 
                onRefresh={loadData} 
                stats={currentStats} 
                onViewLogs={(id, name) => {
                  if (!openLogs.find(app => app.id === id)) setOpenLogs(prev => [...prev, { id, name }]);
                  setActiveLogId(id);
                }} 
              />
            )}
          </div>
        </div>
      </div>

      {openLogs.length > 0 && (
        <LogViewer 
          apps={openLogs} 
          activeAppId={activeLogId}
          onSelectTab={setActiveLogId}
          onCloseTab={(id) => {
            const newLogs = openLogs.filter(app => app.id !== id);
            setOpenLogs(newLogs);
            if (activeLogId === id) setActiveLogId(newLogs.length > 0 ? newLogs[0].id : null);
          }} 
          onCloseAll={() => setOpenLogs([])} 
        />
      )}
    </div>
  );
}

export default App;